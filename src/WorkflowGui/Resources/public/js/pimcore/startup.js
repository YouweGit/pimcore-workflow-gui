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

pimcore.registerNS('pimcore.plugin.WorkflowGuiBundle.startup');

pimcore.plugin.WorkflowGuiBundle.startup = {
    addMenuItem: function () {
        var user = pimcore.globalmanager.get('user');
        var perspectiveCfg = pimcore.globalmanager.get('perspective');

        if (user.isAllowed('workflow_gui') && perspectiveCfg.inToolbar('settings.workflow_gui')) {
            var settingsMenu = new Ext.Action({
                text: t('workflows'),
                icon: '/bundles/pimcoreadmin/img/flat-white-icons/workflow.svg',
                handler : this.showWorkflows
            });

            layoutToolbar.settingsMenu.add(settingsMenu);
        }
    },

    showWorkflows: function () {
        try {
            pimcore.globalmanager.get('workflows').activate();
        }
        catch (e) {
            pimcore.globalmanager.add('workflows', new pimcore.plugin.workflow.panel());
        }
    },
};

document.addEventListener(pimcore.events.pimcoreReady, function () {
    pimcore.plugin.WorkflowGuiBundle.startup.addMenuItem();
});

