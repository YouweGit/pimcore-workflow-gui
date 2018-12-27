<?php

namespace Youwe\Pimcore\WorkflowGui;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class WorkflowGuiBundle extends AbstractPimcoreBundle
{
    const CONFIG_DIR = PIMCORE_PROJECT_ROOT . '/var/bundles/workflow-gui';

    const CONFIG_FILE = self::CONFIG_DIR . '/workflow.yml';

    public function getJsPaths()
    {
        return [
            '/bundles/workflowgui/js/pimcore/startup.js',
            '/bundles/workflowgui/js/pimcore/workflow/panel.js',
            '/bundles/workflowgui/js/pimcore/workflow/item.js',
            '/bundles/workflowgui/js/pimcore/workflow/place.js',
            '/bundles/workflowgui/js/pimcore/workflow/transition.js',
            '/bundles/workflowgui/js/pimcore/workflow/transition_notification.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/abstract.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/simple.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/expression.js',
            '/bundles/workflowgui/js/pimcore/workflow/support_strategy/service.js',
        ];
    }
}
