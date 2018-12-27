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

pimcore.registerNS('pimcore.plugin.workflow.support_strategy.service');
pimcore.plugin.workflow.support_strategy.service = Class.create(pimcore.plugin.workflow.support_strategy.abstract, {
    getSettingsItems: function (id, data) {
        return [{
            xtype: 'textfield',
            fieldLabel: t('workflow_support_strategy_service'),
            name: 'service',
            allowBlank: false,
            value: data.hasOwnProperty('support_strategy') ? data.support_strategy.service : ''
        }];
    },

    getFormData: function (panel) {
        var form = panel.getForm();
        var fieldValues = form.getFieldValues();

        return {
            service: fieldValues['service']
        };
    },
});
