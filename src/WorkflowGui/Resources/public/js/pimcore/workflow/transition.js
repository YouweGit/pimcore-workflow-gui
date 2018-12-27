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

pimcore.registerNS('pimcore.plugin.workflow.transition');
pimcore.plugin.workflow.transition = Class.create({
    initialize: function (store, placesStore, transition) {
        var options = transition.get('options') ? transition.get('options') : {};

        this.store = store;
        this.placesStore = placesStore;

        this.notificationStore = new Ext.data.ArrayStore({
            model: 'WorkflowGUI.Transition.Notification',
        });

        this.notificationStore.setData(options.hasOwnProperty('notificationSettings') ? options.notificationSettings : []);

        this.window = new Ext.window.Window({
            title: t('workflow_transition') + ': ' + transition.getId(),
            items: this.getSettings(transition),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 600,
            height: 500
        });

        this.window.show();
    },

    getSettings: function (transition) {
        var options = transition.get('options') ? transition.get('options') : {};
        var optionNotes = options.hasOwnProperty('notes') ? options.notes : {};

        this.optionsForm = new Ext.form.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'label',
                    value: options.hasOwnProperty('label') ? options.label : '',
                    fieldLabel: t('workflow_transition_label'),
                    allowBlank: false,
                },
                {
                    xtype: 'textfield',
                    name: 'iconClass',
                    value: options.hasOwnProperty('iconClass') ? options.label : '',
                    fieldLabel: t('workflow_transition_icon_class'),
                },
                {
                    xtype: 'combobox',
                    fieldLabel: t('workflow_transition_change_publish_state'),
                    name: 'changePublishedState',
                    store: Ext.data.ArrayStore({
                        fields: ['type'],
                        data: [
                            ['no_change'],
                            ['force_unpublished'],
                            ['force_published'],
                        ]
                    }),
                    value: options.hasOwnProperty('changePublishedState') ? options.changePublishedState : 'no_change',
                    displayField: 'type',
                    valueField: 'type',
                    allowBlank: false
                },
            ]
        });

        this.notesForm = new Ext.form.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'checkbox',
                    name: 'commentEnabled',
                    value: optionNotes.hasOwnProperty('commentEnabled') ? optionNotes.commentEnabled : false,
                    fieldLabel: t('workflow_transition_note_comment_enabled'),
                    allowBlank: false,
                    listeners: {
                        change: function (checkbox, newValue) {
                            if (newValue) {
                                this.notesForm.down('#innerNotes').show();
                                this.notesForm.down('#innerNotes').enable();
                            } else {
                                this.notesForm.down('#innerNotes').hide();
                                this.notesForm.down('#innerNotes').disable();
                            }
                        }.bind(this)
                    }
                },
                {
                    xtype: 'container',
                    itemId: 'innerNotes',
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    hidden: !(optionNotes.hasOwnProperty('commentEnabled') ? optionNotes.commentEnabled : false),
                    disabled: !(optionNotes.hasOwnProperty('commentEnabled') ? optionNotes.commentEnabled : false),
                    items: [
                        {
                            xtype: 'checkbox',
                            name: 'commentRequired',
                            value: optionNotes.hasOwnProperty('commentRequired') ? optionNotes.commentRequired : false,
                            fieldLabel: t('workflow_transition_note_comment_required'),
                            allowBlank: false,
                        },
                        {
                            xtype: 'textfield',
                            name: 'commentSetterFn',
                            value: optionNotes.hasOwnProperty('commentSetterFn') ? optionNotes.commentSetterFn : '',
                            fieldLabel: t('workflow_transition_note_comment_setter')
                        },
                        {
                            xtype: 'textfield',
                            name: 'commentGetterFn',
                            value: optionNotes.hasOwnProperty('commentGetterFn') ? optionNotes.commentGetterFn : '',
                            fieldLabel: t('workflow_transition_note_comment_getter')
                        },
                        {
                            xtype: 'textfield',
                            name: 'type',
                            value: optionNotes.hasOwnProperty('type') ? optionNotes.type : '',
                            fieldLabel: t('workflow_transition_note_type')
                        },
                        {
                            xtype: 'textfield',
                            name: 'title',
                            value: optionNotes.hasOwnProperty('title') ? optionNotes.title : '',
                            fieldLabel: t('workflow_transition_note_title')
                        },
                    ]
                }
            ]
        });

        this.settingsForm = new Ext.form.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'id',
                    value: transition.getId(),
                    fieldLabel: t('workflow_transition_id'),
                    allowBlank: false,
                },

                {
                    xtype: 'textfield',
                    name: 'guard',
                    value: transition.get('guard'),
                    fieldLabel: t('workflow_transition_guard'),
                },
                {
                    xtype: 'combobox',
                    name: 'from',
                    fieldLabel: t('workflow_transition_from'),
                    store: this.placesStore,
                    value: transition.get('from'),
                    displayField: 'id',
                    valueField: 'id',
                    multiSelect: true,
                    queryMode: 'local',
                },
                {
                    xtype: 'combobox',
                    name: 'to',
                    fieldLabel: t('workflow_transition_to'),
                    store: this.placesStore,
                    value: transition.get('to'),
                    displayField: 'id',
                    valueField: 'id',
                    multiSelect: true,
                    queryMode: 'local',
                },
            ]
        });

        this.notificationSettings = new Ext.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'grid',
                    itemId: 'placesGrid',
                    margin: '0 0 15 0',
                    store: this.notificationStore,
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'condition',
                            text: t('workflow_transition_notification_condition'),
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
                                    new pimcore.plugin.workflow.transition_notification(this.notificationStore, grid.store.getAt(rowIndex));
                                }.bind(this)
                            }]
                        },
                    ],
                    tbar: [
                        {
                            text: t('add'),
                            handler: function (btn) {
                                var record = new WorkflowGUI.Transition.Notification();

                                new pimcore.plugin.workflow.transition_notification(this.notificationStore, record);
                            }.bind(this),
                            iconCls: 'pimcore_icon_add'
                        }
                    ]
                }
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
                    title: t('workflow_transition_settings'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.settingsForm
                },
                {
                    xtype: 'fieldset',
                    title: t('workflow_transition_options'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.optionsForm
                },
                {
                    xtype: 'fieldset',
                    title: t('workflow_transition_notes'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.notesForm
                },
                {
                    xtype: 'fieldset',
                    title: t('workflow_transition_notifications'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.notificationSettings
                }
            ],
            buttons: [
                {
                    text: t('save'),
                    handler: function (btn) {
                        if (this.settingsForm.isValid()) {
                            var formValues = this.settingsForm.getForm().getFieldValues();
                            var optionsValues = this.optionsForm.getForm().getFieldValues();
                            var notesValues = this.notesForm.getForm().getFieldValues();
                            var storeRecord = this.store.getById(formValues['id']);
                            var notifications = this.notificationStore.getRange();

                            if (storeRecord && storeRecord !== transition) {
                                Ext.Msg.alert(t('workflow_transition_id'), t('workflow_transition_with_id_already_exists'));
                                return;
                            }

                            notifications = notifications.map(function(record) {
                                var data = record.data;

                                delete data['id'];

                                return data;
                            });

                            this.store.remove(transition);

                            optionsValues['notes'] = notesValues;
                            optionsValues['notificationSettings'] = notifications;

                            if (!formValues['guard']) {
                                delete formValues['guard'];
                            }

                            transition.data = {};
                            transition.set(formValues);
                            transition.set('options', optionsValues);
                            transition.commit();

                            this.store.add(transition);

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
