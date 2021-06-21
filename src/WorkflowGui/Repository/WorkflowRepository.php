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
    protected $configFileResolver;

    public function __construct(ConfigFileResolverInterface $configFileResolver)
    {
        $this->configFileResolver = $configFileResolver;
    }

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

    protected function processConfiguration(): array
    {
        $config = Yaml::parse(
            file_get_contents($this->configFileResolver->getConfigPath())
        );

        $configuration = new Configuration();
        $processor = new Processor();

        $config = $processor->processConfiguration($configuration, $config ?? []);

        return $config['workflows'];
    }
}
