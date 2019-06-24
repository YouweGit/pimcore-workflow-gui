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

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\Traits\PackageVersionTrait;

class WorkflowGuiBundle extends AbstractPimcoreBundle
{
    use PackageVersionTrait;

    /**
     * @inheritDoc
     */
    protected function getComposerPackageName(): string
    {
        return 'youwe/workflow-gui';
    }

    /**
     * @inheritDoc
     */
    public function getNiceName()
    {
        return 'Workflow GUI';
    }

    /**
     * @inheritDoc
     */
    public function getDescription()
    {
        return 'Provides a Graphical User Interface to define Pimcore Workflows';
    }

    /**
     * {@inheritdoc}
     */
    public function getInstaller()
    {
        return $this->container->get(MigrationInstaller::class);
    }

    /**
     * {@inheritdoc}
     */
    public function getJsPaths()
    {
        return [
            '/bundles/workflowgui/js/pimcore/startup.js',
            '/bundles/workflowgui/js/pimcore/workflow/panel.js',
            '/bundles/workflowgui/js/pimcore/workflow/item.js',
            '/bundles/workflowgui/js/pimcore/workflow/place.js',
            '/bundles/workflowgui/js/pimcore/workflow/place_permission.js',
            '/bundles/workflowgui/js/pimcore/workflow/transition.js',
            '/bundles/workflowgui/js/pimcore/workflow/transition_notification.js',
            '/bundles/workflowgui/js/pimcore/workflow/global_action.js',
            '/bundles/workflowgui/js/pimcore/workflow/additional_field.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/abstract.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/simple.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/expression.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/service.js',
        ];
    }

        /**
     * {@inheritdoc}
     */
    public function getCssPaths()
    {
        return [
            '/bundles/workflowgui/css/workflow_gui.css'
        ];
    }
}
