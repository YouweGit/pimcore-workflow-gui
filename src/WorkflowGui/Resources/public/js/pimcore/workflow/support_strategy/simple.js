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

pimcore.registerNS('pimcore.plugin.workflow.support_strategy.simple');
pimcore.plugin.workflow.support_strategy.simple = Class.create(pimcore.plugin.workflow.support_strategy.abstract, {
    getSettingsItems: function (id, data) {
        var addMetaData = function (value) {

            if(typeof value != "string") {
                value = "";
            }

            var count = this.metaDataPanel.query("button").length+1;

            var compositeField = new Ext.form.FieldContainer({
                layout: 'hbox',
                fieldLabel: t('workflow_support_strategy_class'),
                allowBlank: false,
                items: [{
                    xtype: "textfield",
                    value: value,
                    width: "95%",
                    name: "class_" + count,
                }]
            });

            compositeField.add({
                xtype: "button",
                iconCls: "pimcore_icon_delete",
                handler: function (compositeField, el) {
                    this.metaDataPanel.remove(compositeField);
                    this.metaDataPanel.updateLayout();
                }.bind(this, compositeField)
            });

            this.metaDataPanel.add(compositeField);
            this.metaDataPanel.updateLayout();
        }.bind(this);

        this.metaDataPanel = new Ext.form.Panel({
            autoHeight:true,
            border: false,
            items: [{
                xtype: "toolbar",
                style: "margin-bottom: 10px;",
                items: ["->", {
                    xtype: 'button',
                    iconCls: "pimcore_icon_add",
                    handler: addMetaData
                }]
            }]
        });

        try {
            if(data.hasOwnProperty('supports') && data.supports.length > 0) {
                for(var r=0; r < data.supports.length; r++) {
                    addMetaData(data.supports[r]);
                }
            }
        } catch (e) {}

        return [this.metaDataPanel];
    },

    getFormData: function (panel) {
        var form = panel.getForm();
        var fieldValues = form.getFieldValues(),
            classes = [];
        Object.keys(fieldValues).forEach(function(key) {
            classes.push(fieldValues[key]);
        });

        return Ext.Array.unique(classes);
    },
});
