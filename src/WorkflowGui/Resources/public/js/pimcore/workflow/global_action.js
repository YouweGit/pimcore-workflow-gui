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

pimcore.registerNS('pimcore.plugin.workflow.global_action');
pimcore.plugin.workflow.global_action = Class.create({
    initialize: function (store, placesStore, globalAction) {
        this.store = store;
        this.placesStore = placesStore;

        this.window = new Ext.window.Window({
            title: t('workflow_global_action') + ': ' + globalAction.getId(),
            items: this.getSettings(globalAction),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 600,
            height: 500
        });

        this.window.show();
    },

    getSettings: function (globalAction) {
        var notes = globalAction.get('notes') ? globalAction.get('notes') : {};

        this.notesForm = new Ext.form.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'checkbox',
                    name: 'commentEnabled',
                    value: notes.hasOwnProperty('commentEnabled') ? notes.commentEnabled : false,
                    fieldLabel: t('workflow_global_action_note_comment_enabled'),
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
                    hidden: !(notes.hasOwnProperty('commentEnabled') ? notes.commentEnabled : false),
                    disabled: !(notes.hasOwnProperty('commentEnabled') ? notes.commentEnabled : false),
                    items: [
                        {
                            xtype: 'checkbox',
                            name: 'commentRequired',
                            value: notes.hasOwnProperty('commentRequired') ? notes.commentRequired : false,
                            fieldLabel: t('workflow_global_action_note_comment_required'),
                            allowBlank: false,
                        },
                        {
                            xtype: 'textfield',
                            name: 'commentSetterFn',
                            value: notes.hasOwnProperty('commentSetterFn') ? notes.commentSetterFn : '',
                            fieldLabel: t('workflow_global_action_note_comment_setter')
                        },
                        {
                            xtype: 'textfield',
                            name: 'commentGetterFn',
                            value: notes.hasOwnProperty('commentGetterFn') ? notes.commentGetterFn : '',
                            fieldLabel: t('workflow_global_action_note_comment_getter')
                        },
                        {
                            xtype: 'textfield',
                            name: 'type',
                            value: notes.hasOwnProperty('type') ? notes.type : '',
                            fieldLabel: t('workflow_global_action_note_type')
                        },
                        {
                            xtype: 'textfield',
                            name: 'title',
                            value: notes.hasOwnProperty('title') ? notes.title : '',
                            fieldLabel: t('workflow_global_action_note_title')
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
                    value: globalAction.getId(),
                    fieldLabel: t('workflow_global_action_id'),
                    allowBlank: false,
                },
                {
                    xtype: 'textfield',
                    name: 'iconClass',
                    value: globalAction.get('iconClass'),
                    fieldLabel: t('workflow_global_action_icon_class'),
                },
                {
                    xtype: 'textfield',
                    name: 'guard',
                    value: globalAction.get('guard'),
                    fieldLabel: t('workflow_global_action_guard'),
                },
                {
                    xtype: 'combobox',
                    name: 'to',
                    fieldLabel: t('workflow_global_action_to'),
                    store: this.placesStore,
                    value: globalAction.get('to'),
                    displayField: 'id',
                    valueField: 'id',
                    multiSelect: true,
                    queryMode: 'local',
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
                    title: t('workflow_global_action_settings'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.settingsForm
                },
                {
                    xtype: 'fieldset',
                    title: t('workflow_global_action_notes'),
                    defaults: {
                        width: '100%',
                        labelWidth: 200
                    },
                    items: this.notesForm
                },
            ],
            buttons: [
                {
                    text: t('save'),
                    handler: function (btn) {
                        if (this.settingsForm.isValid()) {
                            var formValues = this.settingsForm.getForm().getFieldValues();
                            var notesValues = this.notesForm.getForm().getFieldValues();
                            var storeRecord = this.store.getById(formValues['id']);

                            if (storeRecord && storeRecord !== globalAction) {
                                Ext.Msg.alert(t('workflow_global_action_id'), t('workflow_global_action_with_id_already_exists'));
                                return;
                            }

                            this.store.remove(globalAction);

                            if (!formValues['guard']) {
                                delete formValues['guard'];
                            }

                            globalAction.data = {};
                            globalAction.set(formValues);
                            globalAction.set('notes', notesValues);
                            globalAction.commit();

                            this.store.add(globalAction);

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
