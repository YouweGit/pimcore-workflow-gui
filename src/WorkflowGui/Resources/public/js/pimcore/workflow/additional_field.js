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

pimcore.registerNS('pimcore.plugin.workflow.additional_field');
pimcore.plugin.workflow.additional_field = Class.create({
    initialize: function (store, field) {
        this.store = store;

        this.window = new Ext.window.Window({
            title: t('workflow_additional_field') + ': ' + field.getId(),
            items: this.getSettings(field),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 600,
            height: 500
        });

        this.window.show();
    },

    getFieldTypeDialog: function (type, name, settings) {
        this.fieldTypeSettingsData = new pimcore.object.classes.data[type](null, settings);
        this.fieldTypeSettingsData.datax.name = name;

        var layout = this.fieldTypeSettingsData.getLayout();
        layout.setTitle(null);
        layout.setBodyStyle('border-top:none;');

        this.fieldTypeSettingsData.specificPanel.setTitle(null);

        this.fieldTypeSettingsData.standardSettingsForm.hide();
        this.fieldTypeSettingsData.layoutSettingsForm.hide();

        this.fieldTypeSettings.add(layout);
    },

    getSettings: function (field) {
        this.fieldTypeSettings = new Ext.Panel({});

        this.settingsForm = new Ext.form.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'name',
                    value: field.get('name'),
                    fieldLabel: t('workflow_additional_field_name'),
                    allowBlank: false,
                    listeners: {
                        change: function (input, value) {
                            if (this.fieldTypeSettingsData) {
                                this.fieldTypeSettingsData.datax.name = value;
                            }
                        }.bind(this)
                    }
                },
                {
                    xtype: 'combobox',
                    itemId: 'markingStoreType',
                    fieldLabel: t('workflow_additional_field_type'),
                    name: 'fieldType',
                    store: Ext.data.ArrayStore({
                        fields: ['type'],
                        data: [
                            ['input'],
                            ['textarea'],
                            ['select'],
                            ['datetime'],
                            ['date'],
                            ['user'],
                            ['checkbox']
                        ]
                    }),
                    value: field.get("fieldType"),
                    displayField: 'type',
                    valueField: 'type',
                    allowBlank: false,
                    listeners: {
                        change: function (cmb, value) {
                            this.fieldTypeSettings.removeAll();

                            if (value) {
                                this.getFieldTypeDialog(value, cmb.up('form').down('[name="name"]').getValue(), field.get('fieldTypeSettings'));
                            }
                        }.bind(this),
                        afterrender: function (cmb) {
                            if (cmb.getValue()) {
                                this.getFieldTypeDialog(cmb.getValue(), cmb.up('form').down('[name="name"]').getValue(), field.get('fieldTypeSettings'));
                            }
                        }.bind(this)
                    }
                },
                {
                    xtype: 'textfield',
                    name: 'title',
                    value: field.get('title'),
                    fieldLabel: t('workflow_additional_field_title'),
                },
                {
                    xtype: 'checkbox',
                    name: 'required',
                    value: field.get('required'),
                    fieldLabel: t('workflow_additional_field_required'),
                },
                {
                    xtype: 'textfield',
                    name: 'setterFn',
                    value: field.get('setterFn'),
                    fieldLabel: t('workflow_additional_field_setter_function'),
                },
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
                    title: t('workflow_additional_field_settings'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.settingsForm
                },
                {
                    xtype: 'fieldset',
                    title: t('workflow_additional_field_type_settings'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.fieldTypeSettings
                },
            ],
            buttons: [
                {
                    text: t('save'),
                    handler: function (btn) {
                        if (this.settingsForm.isValid()) {
                            if (!this.fieldTypeSettingsData) {
                                return;
                            }

                            this.fieldTypeSettingsData.applyData();

                            var fieldTypeSettings = this.fieldTypeSettingsData.getData();

                            console.log(fieldTypeSettings);

                            var formValues = this.settingsForm.getForm().getFieldValues();
                            var storeRecord = this.store.getById(formValues['id']);

                            if (storeRecord && storeRecord !== field) {
                                Ext.Msg.alert(t('workflow_additional_field_name'), t('workflow_additional_field_with_name_already_exists'));
                                return;
                            }

                            this.store.remove(field);

                            field.data = {};
                            field.set(formValues);
                            field.set('fieldTypeSettings', fieldTypeSettings);
                            field.commit();

                            this.store.add(field);

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
