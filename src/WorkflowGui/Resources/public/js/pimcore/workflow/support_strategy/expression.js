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

pimcore.registerNS('pimcore.plugin.workflow.support_strategy.expression');
pimcore.plugin.workflow.support_strategy.expression = Class.create(pimcore.plugin.workflow.support_strategy.abstract, {

    getSettingsItems: function (id, data) {

        var classesStore = new Ext.data.JsonStore({
            storeId: 'classesStore',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/admin/workflow/get-classes',
                reader: {
                    rootProperty: 'classes',
                    type: 'json',
                }
            }
        });

        return [{
            xtype: 'combo',
            store: classesStore,
            valueField: 'id',
            displayField: 'name',
            fieldLabel: t('workflow_support_strategy_class'),
            name: 'class',
            allowBlank: false,
            value: data.hasOwnProperty('support_strategy') && data.support_strategy.hasOwnProperty('arguments') ? data.support_strategy.arguments[0] : ''
        }, {
            xtype: 'textfield',
            fieldLabel: t('workflow_support_strategy_expression'),
            name: 'expression',
            allowBlank: false,
            value: data.hasOwnProperty('support_strategy') && data.support_strategy.hasOwnProperty('arguments') ? data.support_strategy.arguments[1] : ''
        }];
    },

    getFormData: function (panel) {
        var form = panel.getForm();
        var fieldValues = form.getFieldValues();

        return {
            type: 'expression',
            arguments: [
                fieldValues['class'],
                fieldValues['expression']
            ]
        };
    },
});
