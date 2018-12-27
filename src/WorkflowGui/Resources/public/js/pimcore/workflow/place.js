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

pimcore.registerNS('pimcore.plugin.workflow.place');
pimcore.plugin.workflow.place = Class.create({
    initialize: function(store, place) {
        this.store = store;

        this.window = new Ext.window.Window({
            title: t('workflow_place') + ': ' + place.getId(),
            items: this.getSettings(place),
            modal : true,
            resizeable : false,
            layout : 'fit',
            width: 600,
            height: 500
        });

        this.window.show();
    },

    getSettings: function (place) {
        this.settingsForm = new Ext.form.Panel({
            bodyStyle:'padding:20px 5px 20px 5px;',
            border: false,
            autoScroll: true,
            forceLayout: true,
            fieldDefaults: {
                labelWidth: 150
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'id',
                    value: place.getId(),
                    fieldLabel: t('workflow_place_id'),
                    allowBlank: false,
                },
                {
                    xtype: 'textfield',
                    name: 'label',
                    value: place.get('label'),
                    fieldLabel: t('workflow_place_label'),
                },
                {
                    xtype: 'textfield',
                    name: 'title',
                    value: place.get('title'),
                    fieldLabel: t('workflow_place_title'),
                },
                {
                    xtype: 'textfield',
                    name: 'color',
                    value: place.get('color'),
                    fieldLabel: t('workflow_place_color'),
                },
                {
                    xtype: 'checkbox',
                    name: 'colorInverted',
                    value: place.get('colorInverted'),
                    fieldLabel: t('workflow_place_color_inverted'),
                },
                {
                    xtype: 'checkbox',
                    name: 'visibleInHeader',
                    value: place.get('visibleInHeader'),
                    fieldLabel: t('workflow_place_visible_in_header'),
                },
                {
                    xtype: 'panel',
                    html: 'TODO: PERMISSIONS'
                }
            ],
            buttons: [
                {
                    text: t('save'),
                    handler: function (btn) {
                        if (this.settingsForm.isValid()) {
                            var formValues = this.settingsForm.getForm().getFieldValues();
                            var storeRecord = this.store.getById(formValues['id']);

                            if (storeRecord && storeRecord !== place) {
                                Ext.Msg.alert(t('workflow_place_id'), t('workflow_place_with_id_already_exists'));
                                return;
                            }

                            place.set(formValues);
                            place.commit();

                            this.window.close();
                        }
                    }.bind(this),
                    iconCls: 'pimcore_icon_apply'
                }
            ],
        });

        return this.settingsForm;
    }
});
