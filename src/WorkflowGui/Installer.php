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

namespace Youwe\Pimcore\WorkflowGui;

use Pimcore\Extension\Bundle\Installer\AbstractInstaller;
use Youwe\Pimcore\WorkflowGui\Resolver\ConfigFileResolverInterface;

final class Installer extends AbstractInstaller
{
    /**
     * @var string
     */
    private $configFile;

    /**
     * @var ConfigFileResolverInterface
     */
    private $configFileResolver;

    /**
     * @param string                      $configFile
     * @param ConfigFileResolverInterface $configFileResolver
     */
    public function __construct(string $configFile, ConfigFileResolverInterface $configFileResolver)
    {
        $this->configFile = $configFile;
        $this->configFileResolver = $configFileResolver;

        parent::__construct();
    }


    /**
     * {@inheritdoc}
     */
    public function install()
    {
        $this->configFileResolver->getConfigPath();

        parent::install();
    }

    /**
     * {@inheritdoc}
     */
    public function canBeInstalled()
    {
        return !file_exists($this->configFile);
    }

    /**
     * {@inheritdoc}
     */
    public function isInstalled()
    {
        return file_exists($this->configFile);
    }
}