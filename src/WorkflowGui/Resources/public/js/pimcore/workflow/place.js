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
    initialize: function (store, place) {
        this.store = store;

        this.permissionsStore = new Ext.data.ArrayStore({
            model: 'WorkflowGUI.Place.Permission',
        });

        this.permissionsStore.setData(place.get('permissions') ? place.get('permissions') : []);

        this.window = new Ext.window.Window({
            title: t('workflow_place') + ': ' + place.getId(),
            items: this.getSettings(place),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 600,
            height: 500
        });

        this.window.show();
    },

    getSettings: function (place) {
        this.permissionSettings = new Ext.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'grid',
                    margin: '0 0 15 0',
                    store: this.permissionsStore,
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'condition',
                            text: t('workflow_place_permission_condition'),
                            flex: 1
                        },
                        {
                            menuDisabled: true,
                            sortable: false,
                            xtype: 'actioncolumn',
                            width: 50,
                            items: [{
                                iconCls: 'pimcore_icon_edit',
                                tooltip: t('edit'),
                                handler: function (grid, rowIndex, colIndex) {
                                    new pimcore.plugin.workflow.place_permission(this.permissionsStore, grid.store.getAt(rowIndex));
                                }.bind(this)
                            }]
                        },
                    ],
                    tbar: [
                        {
                            text: t('add'),
                            handler: function (btn) {
                                var record = new WorkflowGUI.Place.Permission();

                                new pimcore.plugin.workflow.place_permission(this.permissionsStore, record);
                            }.bind(this),
                            iconCls: 'pimcore_icon_add'
                        }
                    ]
                }
            ]
        });

        this.settingsForm = new Ext.form.Panel({
            bodyStyle: 'padding:20px 5px 20px 5px;',
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
                this.permissionSettings
            ]
        });


        this.settingsPanel = new Ext.Panel({
            border: false,
            autoScroll: true,
            padding: 10,
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'fieldset',
                    title: t('workflow_place_settings'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.settingsForm
                },
                {
                    xtype: 'fieldset',
                    title: t('workflow_place_permissions'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.permissionSettings
                }
            ],
            buttons: [
                {
                    text: t('save'),
                    handler: function (btn) {
                        if (this.settingsForm.isValid()) {
                            var formValues = this.settingsForm.getForm().getFieldValues();
                            var storeRecord = this.store.getById(formValues['id']);
                            var permissions = this.permissionsStore.getRange();

                            if (storeRecord && storeRecord !== place) {
                                Ext.Msg.alert(t('workflow_place_id'), t('workflow_place_with_id_already_exists'));
                                return;
                            }

                            permissions = permissions.map(function (record) {
                                var data = record.data;

                                delete data['id'];

                                return data;
                            });

                            place.set('permissions', permissions);
                            place.set(formValues);
                            place.commit();

                            this.window.close();
                        }
                    }.bind(this),
                    iconCls: 'pimcore_icon_apply'
                }
            ],
        });

        return this.settingsPanel;
    }
});
