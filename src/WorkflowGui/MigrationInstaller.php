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

use Doctrine\DBAL\Migrations\Version;
use Doctrine\DBAL\Schema\Schema;
use Pimcore\Db\Connection;
use Pimcore\Extension\Bundle\Installer\MigrationInstaller as PimcoreMigrationInstaller;
use Pimcore\Migrations\MigrationManager;
use Pimcore\Model\User\Permission;
use Symfony\Component\HttpKernel\Bundle\BundleInterface;
use Youwe\Pimcore\WorkflowGui\Resolver\ConfigFileResolverInterface;

final class MigrationInstaller extends PimcoreMigrationInstaller
{
    /**
     * @var ConfigFileResolverInterface
     */
    private $configFileResolver;

    /**
     * @param BundleInterface             $bundle
     * @param Connection                  $connection
     * @param MigrationManager            $migrationManager
     * @param ConfigFileResolverInterface $configFileResolver
     */
    public function __construct(
        BundleInterface $bundle,
        Connection $connection,
        MigrationManager $migrationManager,
        ConfigFileResolverInterface $configFileResolver
    ) {
        parent::__construct($bundle, $connection, $migrationManager);

        $this->configFileResolver = $configFileResolver;
    }


    /**
     * {@inheritdoc}
     */
    public function migrateInstall(Schema $schema, Version $version)
    {
        $this->configFileResolver->getConfigPath();

        $permissionDefinition = new Permission\Definition();
        $permissionDefinition->setKey('workflow_gui');
        $permissionDefinition->save();
    }

    /**
     * {@inheritdoc}
     */
    public function migrateUninstall(Schema $schema, Version $version)
    {

    }
}