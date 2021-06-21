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
 * @copyright  Copyright (c) 2018-2021 Youwe (https://www.youwe.nl)
 * @license    https://github.com/YouweGit/pimcore-workflow-gui/blob/master/LICENSE.md     GNU General Public License version 3 (GPLv3)
 */

namespace Youwe\Pimcore\WorkflowGui\Installer;

use Pimcore\Db;
use Pimcore\Extension\Bundle\Installer\SettingsStoreAwareInstaller;
use Pimcore\Model\User\Permission;
use Symfony\Component\HttpKernel\Bundle\BundleInterface;

final class WorkflowGuiInstaller extends SettingsStoreAwareInstaller
{
    const WORKFLOW_GUI = 'workflow_gui';

    public function install(): void
    {
        $this->addPermissionToPanel();
        $this->markInstalled();
    }

    public function uninstall(): void
    {
        $this->removePermissionFromPanel();
        $this->markUninstalled();
    }

    private function addPermissionToPanel(): void
    {
        $permissionDefinition = new Permission\Definition();
        $permissionDefinition->setKey(self::WORKFLOW_GUI);
        $permissionDefinition->save();
    }

    private function removePermissionFromPanel(): void
    {
        $state = Db::get()->prepare("DELETE FROM `users_permission_definitions` WHERE `key` = :key");
        $state->bindValue("key", self::WORKFLOW_GUI);
        $state->execute();
    }
}
