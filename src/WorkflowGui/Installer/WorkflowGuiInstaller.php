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

use Pimcore\Extension\Bundle\Installer\SettingsStoreAwareInstaller;

final class WorkflowGuiInstaller extends SettingsStoreAwareInstaller
{
    public function install(): void
    {
        $this->markInstalled();
    }

    public function uninstall(): void
    {
        $this->markUninstalled();
    }
}
