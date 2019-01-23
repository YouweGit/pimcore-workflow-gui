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
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Yaml\Yaml;
use Youwe\Pimcore\WorkflowGui\Repository\WorkflowRepositoryInterface;
use Youwe\Pimcore\WorkflowGui\Resolver\ConfigFileResolver;

class WorkflowController extends AdminController
{
    /**
     * @var WorkflowRepositoryInterface
     */
    protected $repository;

    /**
     * @param WorkflowRepositoryInterface $repository
     */
    public function __construct(WorkflowRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function listAction(Request $request)
    {
        $this->isGrantedOr403();

        return $this->json(array_map(function ($workflowKey) {
            return ['id' => $workflowKey];
        }, array_keys($this->repository->findAll())));
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getAction(Request $request)
    {
        $this->isGrantedOr403();

        $id = $request->get('id');
        $workflow = $this->repository->find($id);

        if (!$workflow) {
            throw new NotFoundHttpException();
        }

        return $this->json(['success' => true, 'data' => $workflow]);
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function saveAction(Request $request)
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
            $config = $processor->processConfiguration($configuration, [
                    'pimcore' =>
                        [
                            'workflows' => [
                                $newId => $testConfig,
                            ],
                        ],
                ]
            );
        } catch (\Exception $ex) {
            return $this->json(['success' => false, 'message' => $ex->getMessage()]);
        }

        $configPath = $this->get(ConfigFileResolver::class)->getConfigPath();

        $contents = Yaml::parseFile($configPath);

        if (isset($contents['pimcore']['workflows'][$id])) {
            unset($contents['pimcore']['workflows'][$id]);
        }

        $contents['pimcore']['workflows'][$newId] = $newConfiguration;

        file_put_contents($configPath, Yaml::dump($contents, 100));

        $workflow = $this->repository->find($id);

        return $this->json(['success' => true, 'data' => $workflow]);
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function deleteAction(Request $request)
    {
        $this->isGrantedOr403();

        $id = $request->get('id');

        $configPath = $this->get(ConfigFileResolver::class)->getConfigPath();

        $contents = Yaml::parseFile($configPath);

        if (isset($contents['pimcore']['workflows'][$id])) {
            unset($contents['pimcore']['workflows'][$id]);
        }

        file_put_contents($configPath, Yaml::dump($contents, 100));

        return $this->json(['success' => true]);
    }

    /**
     * @param Request $request
     * @return \Pimcore\Bundle\AdminBundle\HttpFoundation\JsonResponse
     */
    public function searchRolesAction(Request $request)
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

    /**
     * @throws AccessDeniedException
     */
    protected function isGrantedOr403()
    {
        $user = $this->getAdminUser();

        if ($user->isAllowed('workflow_gui')) {
            return;
        }

        throw new AccessDeniedException();
    }

    protected function sanitizeConfiguration($configuration)
    {
        if (isset($configuration['places'])) {
            foreach ($configuration['places'] as $placeKey => &$placeConfig) {
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
}
