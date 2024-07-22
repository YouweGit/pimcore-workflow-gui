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

namespace Youwe\Pimcore\WorkflowGui\Repository;

use Pimcore\Bundle\CoreBundle\DependencyInjection\Configuration;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Yaml\Yaml;
use Youwe\Pimcore\WorkflowGui\Resolver\ConfigFileResolverInterface;

class WorkflowRepository implements WorkflowRepositoryInterface
{
    public function __construct(
        protected ConfigFileResolverInterface $configFileResolver,
    ) {}

    public function findAll(): array
    {
        return $this->processConfiguration();
    }

    public function find($id): array
    {
        $all = $this->findAll();
        $filtered = array_filter(
            $all,
            function ($key) use ($id) {
                return $id === $key;
            },
            ARRAY_FILTER_USE_KEY
        );

        return reset($filtered);
    }

    public function updateConfig(callable $workflowsRewriter): void
    {
        $config = $this->loadConfig();
        $config['pimcore']['workflows'] = $workflowsRewriter($config['pimcore']['workflows'] ?? []);
        $this->storeConfig($config);
    }

    protected function processConfiguration(): array
    {
        $config = $this->loadConfig();

        $configuration = new Configuration();
        $processor = new Processor();

        $config = $processor->processConfiguration($configuration, $config ?? []);

        return $config['workflows'];
    }

    protected function loadConfig(): array
    {
        return Yaml::parse(
            file_get_contents($this->configFileResolver->getConfigPath())
        ) ?? [];
    }

    protected function storeConfig(array $config): void
    {
        file_put_contents(
            $this->configFileResolver->getConfigPath(),
            Yaml::dump($config, 100)
        );
    }
}
