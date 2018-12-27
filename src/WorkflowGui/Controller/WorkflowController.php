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
     * @return \Pimcore\Bundle\AdminBundle\HttpFoundation\JsonResponse
     */
    public function searchRolesAction(Request $request)
    {
        $q = '%'.$request->get('query').'%';

        $list = new User\Listing();
        $list->setCondition('name LIKE ?', [$q]);
        $list->setOrder('ASC');
        $list->setOrderKey('name');
        $list->load();

        $users = [];
        if (is_array($list->getUsers())) {
            foreach ($list->getUsers() as $user) {
                if ($user instanceof User\Role && $user->getId()) {
                    $users[] = [
                        'id' => $user->getId(),
                        'name' => $user->getName(),
                    ];
                }
            }
        }

        return $this->adminJson([
            'success' => true,
            'roles' => $users,
        ]);
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

                    if (isset($transitionConfig['options']['notes'])) {
                        if (!$transitionConfig['options']['notes']['commentEnabled']) {
                            unset($transitionConfig['options']['notes']);
                        }
                    }
                }
            }
        }

        return $configuration;
    }
}
