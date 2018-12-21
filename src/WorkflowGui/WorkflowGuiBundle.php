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
            '/bundles/workflowgui/js/pimcore/startup.js'
        ];
    }
}
