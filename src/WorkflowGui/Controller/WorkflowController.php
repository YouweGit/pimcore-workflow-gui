<?php
/**
 * Workflow Pimcore Plugin
 *
 * LICENSE
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2018-2019 Youwe (https://www.youwe.nl)
 * @license    https://github.com/YouweGit/pimcore-workflow-gui/blob/master/LICENSE.md     GNU General Public License version 3 (GPLv3)
 */

declare(strict_types=1);

namespace Youwe\Pimcore\WorkflowGui\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use Pimcore\Bundle\CoreBundle\DependencyInjection\Configuration;
use Pimcore\Model\User;
use Pimcore\Tool\Console;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Process\Process;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Yaml\Yaml;
use Youwe\Pimcore\WorkflowGui\Repository\WorkflowRepositoryInterface;
use Youwe\Pimcore\WorkflowGui\Resolver\ConfigFileResolverInterface;

class WorkflowController extends AdminController
{
    protected WorkflowRepositoryInterface $repository;
    protected ConfigFileResolverInterface $configResolver;
    protected KernelInterface $kernel;

    public function __construct(
        WorkflowRepositoryInterface $repository,
        ConfigFileResolverInterface $configFileResolver,
        KernelInterface $kernel
    ) {
        $this->repository = $repository;
        $this->configResolver = $configFileResolver;
        $this->kernel = $kernel;
    }

    public function listAction(): JsonResponse
    {
        $this->isGrantedOr403();

        $workflows = $this->repository->findAll();

        $results = [];
        foreach ($workflows as $id => $workflow) {
            $results[] = [
                'id' => $id,
                'label' => $workflow['label'],
            ];
        }

        return $this->json($results);
    }

    public function getAction(Request $request): JsonResponse
    {
        $this->isGrantedOr403();

        $id = $request->get('id');
        $workflow = $this->repository->find($id);

        if (!$workflow) {
            throw new NotFoundHttpException();
        }

        return $this->json(['success' => true, 'data' => $workflow]);
    }

    public function cloneAction(Request $request): JsonResponse
    {
        $this->isGrantedOr403();

        $id = $request->get('id');
        $name = $request->get('name');
        $workflow = $this->repository->find($id);
        $workflowByName = $this->repository->find($name);

        if (!$workflow) {
            throw new NotFoundHttpException();
        }

        if ($workflowByName) {
            return $this->json([
                'success' => false,
                'message' => $this->trans('workflow_gui_workflow_with_name_already_exists'),
            ]);
        }

        $configPath = $this->configResolver->getConfigPath();

        $contents = Yaml::parseFile($configPath);
        $newWorkflow = $contents['pimcore']['workflows'][$id];

        $contents['pimcore']['workflows'][$name] = $newWorkflow;

        file_put_contents($configPath, Yaml::dump($contents, 100));

        return $this->json(['success' => true, 'id' => $name]);
    }

    public function saveAction(Request $request): JsonResponse
    {
        $this->isGrantedOr403();

        $id = $request->get('id');
        $newId = $request->get('newId');
        $newConfiguration = $this->decodeJson($request->get('data'));

        $newConfiguration = $this->sanitizeConfiguration($newConfiguration);
        $testConfig = $newConfiguration;

        //Test Configuration
        $configuration = new Configuration();
        $processor = new Processor();

        try {
            $processor->processConfiguration($configuration, [
                    'pimcore' =>
                        [
                            'workflows' => [
                                $newId => $testConfig,
                            ],
                        ],
                ]
            );
        } catch (\Throwable $ex) {
            return $this->json(['success' => false, 'message' => $ex->getMessage()]);
        }

        $configPath = $this->configResolver->getConfigPath();

        $contents = Yaml::parseFile($configPath);

        if (isset($contents['pimcore']['workflows'][$id])) {
            unset($contents['pimcore']['workflows'][$id]);
        }

        $contents['pimcore']['workflows'][$newId] = $newConfiguration;

        file_put_contents($configPath, Yaml::dump($contents, 100));

        $workflow = $this->repository->find($id);

        return $this->json(['success' => true, 'data' => $workflow]);
    }

    public function deleteAction(Request $request): JsonResponse
    {
        $this->isGrantedOr403();

        $id = $request->get('id');

        $configPath = $this->configResolver->getConfigPath();

        $contents = Yaml::parseFile($configPath);

        if (isset($contents['pimcore']['workflows'][$id])) {
            unset($contents['pimcore']['workflows'][$id]);
        }

        file_put_contents($configPath, Yaml::dump($contents, 100));

        return $this->json(['success' => true]);
    }

    public function searchRolesAction(Request $request): JsonResponse
    {
        $this->isGrantedOr403();

        $q = '%'.$request->get('query').'%';

        $list = new User\Role\Listing();
        $list->setCondition('name LIKE ?', [$q]);
        $list->setOrder('ASC');
        $list->setOrderKey('name');
        $list->load();

        $roles = [];
        if (is_array($list->getRoles())) {

            /** @var User\Role $role */
            foreach ($list->getRoles() as $role) {
                if ($role instanceof User\Role && $role->getId()) {
                    $roles[] = [
                        'id' => $role->getId(),
                        'name' => $role->getName(),
                    ];
                }
            }
        }

        return $this->adminJson([
            'success' => true,
            'roles' => $roles,
        ]);
    }

    protected function isGrantedOr403(): void
    {
        $user = $this->getAdminUser();

        if (null === $user) {
            throw new AccessDeniedException();
        }

        if ($user->isAllowed('workflow_gui')) {
            return;
        }

        throw new AccessDeniedException();
    }

    protected function sanitizeConfiguration($configuration): array
    {
        if (isset($configuration['places'])) {
            foreach ($configuration['places'] as $placeKey => &$placeConfig) {
                if (isset($placeConfig['color'])) {
                    if (substr($placeConfig['color'], 0, 1) !== '#') {
                        $placeConfig['color'] = '#'.$placeConfig['color'];
                    }
                }
                foreach ($placeConfig as $placeConfigKey => $value) {
                    if (!$value) {
                        unset($placeConfig[$placeConfigKey]);
                    }
                }

                if (isset($placeConfig['permissions'])) {
                    foreach ($placeConfig['permissions'] as $permissionIndex => &$permissionConfig) {
                        foreach ($permissionConfig as $permissionKey => $permissionValue) {
                            if ($permissionValue === null || ($permissionKey === 'condition' && !$permissionValue)) {
                                unset($permissionConfig[$permissionKey]);
                            }
                        }

                        if (count($permissionConfig) === 0) {
                            unset ($placeConfig['permissions'][$permissionIndex]);
                        }
                    }

                    if (count($placeConfig['permissions']) === 0) {
                        unset($placeConfig['permissions']);
                    }
                }
            }
        }

        if (isset($configuration['transitions'])) {
            foreach ($configuration['transitions'] as $transitionKey => &$transitionConfig) {
                if (isset($transitionConfig['options'])) {
                    foreach ($transitionConfig['options'] as $transitionOptionConfigKey => $value) {
                        if (!$value) {
                            unset($transitionConfig['options'][$transitionOptionConfigKey]);
                        }
                    }

                    if (isset($transitionConfig['options']['notes']['additionalFields'])) {
                        foreach ($transitionConfig['options']['notes']['additionalFields'] as &$additionalField) {
                            if (!$additionalField['setterFn']) {
                                unset ($additionalField['setterFn']);
                            }

                            if (!$additionalField['title']) {
                                unset ($additionalField['title']);
                            }

                            if (!$additionalField['required']) {
                                unset ($additionalField['required']);
                            }
                        }
                    }
                }
            }
        }

        return $configuration;
    }

    public function visualizeAction(Request $request): Response
    {
        $this->isGrantedOr403();

        try {
            return new Response($this->container->get('twig')->render(
                '@WorkflowGui/Workflow/visualize.html.twig',
                [
                    'image' => $this->getVisualization($request->get('workflow'), 'svg'),
                ]
            ));
        } catch (\Throwable $e) {
            return new Response($e->getMessage());
        }
    }

    public function visualizeImageAction(Request $request): Response
    {
        $this->isGrantedOr403();

        try {
            $image = $this->getVisualization($request->get('workflow'), 'png');

            $response = new Response();

            // Set headers
            $response->headers->set('Cache-Control', 'private');
            $response->headers->set('Content-type', 'image/png');
            $response->headers->set('Content-length', strlen($image));

            // Send headers before outputting anything
            $response->sendHeaders();

            $response->setContent($image);

            return $response;
        } catch (\Throwable $e) {
            return new Response($e->getMessage());
        }
    }

    private function getVisualization($workflow, $format): string
    {
        $php = Console::getExecutable('php');
        $dot = Console::getExecutable('dot');

        if (!$php) {
            throw new \InvalidArgumentException($this->trans('workflow_cmd_not_found', ['php']));
        }

        if (!$dot) {
            throw new \InvalidArgumentException($this->trans('workflow_cmd_not_found', ['dot']));
        }

        $cmd = $php.' '.PIMCORE_PROJECT_ROOT.'/bin/console --env="${:arg_environment}" pimcore:workflow:dump "${:arg_workflow}" | '.$dot.' -T"${:arg_format}"';

        $cmd = Console::addLowProcessPriority($cmd);
        $process = Process::fromShellCommandline($cmd);
        $process->run(null, [
            'arg_environment' => $this->kernel->getEnvironment(),
            'arg_workflow' => $workflow,
            'arg_format' => $format,
        ]);

        return $process->getOutput();
    }
}
