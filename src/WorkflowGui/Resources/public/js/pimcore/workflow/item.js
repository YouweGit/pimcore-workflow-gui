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

pimcore.registerNS('pimcore.plugin.workflow.item');
pimcore.plugin.workflow.item = Class.create({

    initialize: function (id, data, parentPanel, panelKey) {
        var me = this;

        me.panelKey = panelKey;
        me.parentPanel = parentPanel;
        me.data = data;
        me.id = id;

        if (!Ext.ClassManager.isCreated('WorkflowGUI.Place')) {
            Ext.define('WorkflowGUI.Place', {
                extend: 'Ext.data.Model',
                idProperty: 'id',
                fields: [
                    'id',
                    'label',
                    'title',
                    'color',
                    'colorInverted',
                    'visibleInHeader',
                    'permissions',
                ]
            });
        }

        if (!Ext.ClassManager.isCreated('WorkflowGUI.AdditionalField')) {
            Ext.define('WorkflowGUI.AdditionalField', {
                extend: 'Ext.data.Model',
                idProperty: 'name',
                fields: [
                    'name',
                    'fieldType',
                    'title',
                    'required',
                    'setterFn',
                    'fieldTypeSettings',
                ]
            });
        }

        if (!Ext.ClassManager.isCreated('WorkflowGUI.Place.Permission')) {
            Ext.define('WorkflowGUI.Place.Permission', {
                extend: 'Ext.data.Model',
                idProperty: 'id',
                fields: [
                    'id',
                    'condition',
                    'save',
                    'publish',
                    'unpublish',
                    'delete',
                    'rename',
                    'view',
                    'settings',
                    'versions',
                    'properties',
                    'modify',
                    'objectLayout'
                ]
            });
        }

        this.placesStore = new Ext.data.ArrayStore({
            model: 'WorkflowGUI.Place'
        });

        if (!Ext.ClassManager.isCreated('WorkflowGUI.Transition')) {
            Ext.define('WorkflowGUI.Transition', {
                extend: 'Ext.data.Model',
                idProperty: 'id',
                fields: [
                    'id',
                    'from',
                    'to',
                    'options'
                ]
            });
        }

        if (!Ext.ClassManager.isCreated('WorkflowGUI.Transition.Notification')) {
            Ext.define('WorkflowGUI.Transition.Notification', {
                extend: 'Ext.data.Model',
                fields: [
                    'condition',
                    'notifyUsers',
                    'notifyRoles',
                    'mailType',
                    'mailPath'
                ]
            });
        }

        this.transitionStore = new Ext.data.ArrayStore({
            model: 'WorkflowGUI.Transition'
        });

        this.globalActionsStore = new Ext.data.ArrayStore({
            model: 'WorkflowGUI.Transition'
        });

        var places = this.data.hasOwnProperty('places') ? this.data.places : {};

        places = Object.keys(places).map(function (objectKey, index) {
            var place = places[objectKey];
            place['id'] = objectKey;

            return place;
        });

        this.placesStore.setData(places);

        var transitions = this.data.hasOwnProperty('transitions') ? this.data.transitions : {};

        transitions = Object.keys(transitions).map(function (objectKey, index) {
            var transition = transitions[objectKey];
            transition['id'] = objectKey;

            return transition;
        });

        this.transitionStore.setData(transitions);

        var globalActions = this.data.hasOwnProperty('globalActions') ? this.data.globalActions : {};

        globalActions = Object.keys(globalActions).map(function (objectKey, index) {
            var globalAction = globalActions[objectKey];
            globalAction['id'] = objectKey;

            return globalAction;
        });

        this.globalActionsStore.setData(globalActions);

        me.addLayout();
    },

    loadComplete: function (transport) {
        var me = this,
            response = Ext.decode(transport.responseText);

        if (response && response.success) {
            me.data = response.data;

            me.addLayout();
        }
    },

    addLayout: function () {
        this.panel = new Ext.TabPanel({
            activeTab: 0,
            deferredRender: false,
            forceLayout: true,
            border: false,
            closable: true,
            autoScroll: true,
            title: this.id,
            iconCls: 'pimcore_icon_workflow_action',
            items: [
                this.getSettingsPanel(),
                this.getSupportsPanel(),
                this.getPlacesPanel(),
                this.getTransitionsPanel(),
                this.getGlobalActionsPanel(),
                this.getVisualizationPanel()
            ],
            buttons: [
                {
                    text: t('workflow_gui_clone'),
                    iconCls: 'pimcore_icon_copy',
                    handler: this.clone.bind(this)
                },
                {
                    text: t('save'),
                    iconCls: 'pimcore_icon_apply',
                    handler: this.save.bind(this)
                }
            ]
        });

        this.panel.on('destroy', function () {
            delete this.parentPanel.panels[this.panelKey];
        }.bind(this));

        this.parentPanel.getEditPanel().add(this.panel);
        this.parentPanel.getEditPanel().setActiveTab(this.panel);

        pimcore.layout.refresh();
    },

    getDefaults: function () {
        return {
            width: '100%',
            labelWidth: 200
        };
    },

    getSettingsPanel: function () {
        var markingStoreArgumentsData = this.data.hasOwnProperty('marking_store') ? this.data.marking_store.arguments : [];
        var markingStoreArguments = new Ext.data.ArrayStore({
            data: markingStoreArgumentsData.map(function(value, index) {
                return [[value]];
            }),
            fields: [
                'argument',
            ]
        });

        this.markingStorePanel = new Ext.form.Panel({
            defaults: this.getDefaults(),
            items: [
                {
                    xtype: 'combobox',
                    itemId: 'markingStoreType',
                    fieldLabel: t('workflow_marking_store_type'),
                    name: 'type',
                    store: Ext.data.ArrayStore({
                        fields: ['store'],
                        data: [
                            ['multiple_state'],
                            ['single_state'],
                            ['state_table'],
                            ['data_object_multiple_state'],
                            ['data_object_splitted_state']
                        ]
                    }),
                    value: this.data.marking_store ? this.data.marking_store.type : 'single_state',
                    displayField: 'store',
                    valueField: 'store',
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    name: 'service',
                    value: this.data.marking_store ? this.data.marking_store.service : null,
                    fieldLabel: t('workflow_marking_store_service'),
                    listeners: {
                        change: function (cmb, newValue) {
                            if (newValue) {
                                this.markingStorePanel.down('#markingStoreArgumentsGrid').disable();
                                this.markingStorePanel.down('#markingStoreType').disable();
                            } else {
                                this.markingStorePanel.down('#markingStoreArgumentsGrid').enable();
                                this.markingStorePanel.down('#markingStoreType').enable();
                            }
                        }.bind(this)
                    }
                },
                {
                    xtype: 'grid',
                    disabled: this.data.marking_store ? this.data.marking_store.service : false,
                    itemId: 'markingStoreArgumentsGrid',
                    title: t('workflow_marking_store_arguments'),
                    margin: '0 0 15 0',
                    store: markingStoreArguments,
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1
                        })
                    ],
                    sm: Ext.create('Ext.selection.RowModel', {}),
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'argument',
                            text: t('workflow_marking_store_argument'),
                            flex: 1,
                            field: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            menuDisabled: true,
                            sortable: false,
                            xtype: 'actioncolumn',
                            width: 50,
                            items: [{
                                iconCls: 'pimcore_icon_delete',
                                tooltip: t('delete'),
                                handler: function (grid, rowIndex, colIndex) {
                                    grid.store.removeAt(rowIndex);
                                }.bind(this)
                            }]
                        },
                    ],
                    tbar: [
                        {
                            text: t('add'),
                            handler: function (btn) {
                                btn.up('grid').store.add({});
                            },
                            iconCls: 'pimcore_icon_add'
                        }
                    ],
                    viewConfig: {
                        forceFit: true
                    }
                },
            ]
        });

        this.auditTrailPanel = new Ext.form.Panel({
            defaults: this.getDefaults(),
            items: [
                {
                    xtype: 'checkbox',
                    name: 'enabled',
                    value: this.data.hasOwnProperty('audit_trail') ? this.data.audit_trail.enabled : false,
                    fieldLabel: t('workflow_audit_trail_enabled')
                }
            ]
        });

        this.settingsPanelForm = new Ext.form.Panel({
            defaults: this.getDefaults(),
            items: [
                {
                    xtype: 'textfield',
                    name: 'name',
                    value: this.id,
                    fieldLabel: t('workflow_name'),
                    allowBlank: false,
                    regex: /^[a-zA-Z_]+$/
                },
                {
                    xtype: 'checkbox',
                    name: 'enabled',
                    value: this.data.enabled,
                    fieldLabel: t('workflow_enabled')
                },
                {
                    xtype: 'numberfield',
                    name: 'priority',
                    value: this.data.priority ? this.data.priority : 1,
                    fieldLabel: t('workflow_priority'),
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    name: 'label',
                    value: this.data.label,
                    fieldLabel: t('workflow_label'),
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    fieldLabel: t('workflow_initial_place'),
                    store: this.placesStore,
                    name: 'initial_place',
                    value: this.data.initial_place,
                    displayField: 'id',
                    valueField: 'id',
                    queryMode: 'local'
                },
                {
                    xtype: 'combobox',
                    fieldLabel: t('workflow_type'),
                    name: 'type',
                    store: Ext.data.ArrayStore({
                        fields: ['type'],
                        data: [['workflow'], ['state_machine']]
                    }),
                    value: this.data.type ? this.data.type : 'workflow',
                    displayField: 'type',
                    valueField: 'type',
                    allowBlank: false
                },
            ]
        });

        this.settingsPanel = new Ext.Panel({
            border: false,
            autoScroll: true,
            title: t('workflow_settings'),
            iconCls: 'pimcore_icon_settings',
            padding: 10,
            defaults: this.getDefaults(),
            items: [
                {
                    xtype: 'fieldset',
                    title: t('workflow_settings'),
                    defaults: this.getDefaults(),
                    items: this.settingsPanelForm
                },
                {
                    xtype: 'fieldset',
                    defaults: this.getDefaults(),
                    title: t('workflow_audit_trail'),
                    items: this.auditTrailPanel
                },
                {
                    xtype: 'fieldset',
                    defaults: this.getDefaults(),
                    title: t('workflow_marking_store'),
                    items: this.markingStorePanel
                },
            ]
        });

        return this.settingsPanel;
    },

    getSupportsPanel: function () {
        var supportType = 'simple';

        if (!this.data.hasOwnProperty('support_strategy')) {
            supportType = 'simple';
        } else {
            if (this.data.support_strategy.hasOwnProperty('service') && this.data.support_strategy.service) {
                supportType = service;
            } else if (this.data.support_strategy.hasOwnProperty('type') && this.data.support_strategy.type) {
                supportType = this.data.support_strategy.type;
            }
        }

        this.supportPanelDetailPanel = new pimcore.plugin.workflow.support_strategy[supportType]();

        this.supportsPanel = new Ext.form.Panel({
            border: false,
            autoScroll: true,
            title: t('workflow_settings_supports'),
            iconCls: 'pimcore_icon_settings',
            padding: 10,
            defaults: this.getDefaults(),
            items: [
                {
                    xtype: 'combobox',
                    itemId: 'supportStrategy',
                    fieldLabel: t('workflow_support_strategy'),
                    store: Ext.data.ArrayStore({
                        fields: ['support_strategy'],
                        data: [
                            ['simple'],
                            ['expression'],
                            ['service'],
                        ]
                    }),
                    value: supportType,
                    displayField: 'support_strategy',
                    valueField: 'support_strategy',
                    listeners: {
                        change: function (cmb, newValue) {
                            this.supportPanelDetailPanel = new pimcore.plugin.workflow.support_strategy[newValue]();

                            this.supportsPanel.down('#supportStrategySettings').removeAll();
                            this.supportsPanel.down('#supportStrategySettings').add(this.supportPanelDetailPanel.getSettingsForm(this.id, this.data));
                        }.bind(this)
                    }
                },
                {
                    xtype: 'fieldset',
                    itemId: 'supportStrategySettings',
                    title: t('workflow_support_strategy'),
                    items: this.supportPanelDetailPanel.getSettingsForm(this.id, this.data)
                }
            ]
        });

        return this.supportsPanel;
    },

    getPlacesPanel: function () {
        this.placesPanel = new Ext.Panel({
            border: false,
            autoScroll: true,
            title: t('workflow_settings_places'),
            iconCls: 'pimcore_icon_settings',
            padding: 10,
            items: [{
                xtype: 'grid',
                itemId: 'placesGrid',
                title: t('workflow_places'),
                margin: '0 0 15 0',
                store: this.placesStore,
                columns: [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'id',
                        text: t('workflow_place_id'),
                        flex: 1
                    },
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'label',
                        text: t('workflow_place_label'),
                        flex: 1
                    },
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'title',
                        text: t('workflow_place_title'),
                        flex: 1
                    },
                    {
                        menuDisabled: true,
                        sortable: false,
                        xtype: 'actioncolumn',
                        width: 60,
                        items: [{
                            iconCls: 'pimcore_icon_edit',
                            tooltip: t('edit'),
                            handler: function (grid, rowIndex, colIndex) {
                                new pimcore.plugin.workflow.place(this.placesStore, grid.store.getAt(rowIndex));
                            }.bind(this)
                        }, {
                            iconCls: 'pimcore_icon_delete',
                            tooltip: t('delete'),
                            handler: function (grid, rowIndex, colIndex) {
                                grid.store.removeAt(rowIndex);
                            }.bind(this)
                        }]
                    },
                ],
                tbar: [
                    {
                        text: t('add'),
                        handler: function (btn) {
                            Ext.MessageBox.prompt(t('workflow_place_id'), t('workflow_enter_place_id'), function (button, value) {
                                if (button === 'ok') {
                                    if (this.placesStore.getById(value)) {
                                        Ext.Msg.alert(t('workflow_place_id'), t('workflow_place_with_id_already_exists'));
                                        return;
                                    }

                                    if (value.match(/^[a-zA-Z_]+$/)) {
                                        var record = new WorkflowGUI.Place({
                                            id: value
                                        });

                                        this.placesStore.add(record);

                                        new pimcore.plugin.workflow.place(this.placesStore, record);
                                    }
                                    else {
                                        Ext.Msg.alert(t('workflow_place_id'), t('workflow_problem_creating_workflow_invalid_characters'));
                                    }
                                }
                            }.bind(this), null, null, '');
                        }.bind(this),
                        iconCls: 'pimcore_icon_add'
                    }
                ]
            }]
        });

        return this.placesPanel;
    },

    getTransitionsPanel: function () {
        this.transitionsPanel = new Ext.Panel({
            border: false,
            autoScroll: true,
            title: t('workflow_settings_transitions'),
            iconCls: 'pimcore_icon_settings',
            padding: 10,
            items: [{
                xtype: 'grid',
                title: t('workflow_transitions'),
                margin: '0 0 15 0',
                store: this.transitionStore,
                columns: [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'id',
                        text: t('workflow_transition_id'),
                        flex: 1
                    },
                    {
                        menuDisabled: true,
                        sortable: false,
                        xtype: 'actioncolumn',
                        width: 60,
                        items: [{
                            iconCls: 'pimcore_icon_edit',
                            tooltip: t('edit'),
                            handler: function (grid, rowIndex, colIndex) {
                                new pimcore.plugin.workflow.transition(this.transitionStore, this.placesStore, grid.store.getAt(rowIndex));
                            }.bind(this)
                        }, {
                            iconCls: 'pimcore_icon_delete',
                            tooltip: t('delete'),
                            handler: function (grid, rowIndex, colIndex) {
                                grid.store.removeAt(rowIndex);
                            }.bind(this)
                        }]
                    },
                ],
                tbar: [
                    {
                        text: t('add'),
                        handler: function (btn) {
                            Ext.MessageBox.prompt(t('workflow_transition_id'), t('workflow_enter_transition_id'), function (button, value) {
                                if (button === 'ok') {
                                    if (this.transitionStore.getById(value)) {
                                        Ext.Msg.alert(t('workflow_transition_id'), t('workflow_transition_with_id_already_exists'));
                                        return;
                                    }

                                    if (value.match(/^[a-zA-Z_]+$/)) {
                                        var record = new WorkflowGUI.Transition({
                                            id: value
                                        });

                                        this.transitionStore.add(record);

                                        new pimcore.plugin.workflow.transition(this.transitionStore, this.placesStore, record);
                                    }
                                    else {
                                        Ext.Msg.alert(t('workflow_transition_id'), t('workflow_problem_creating_workflow_invalid_characters'));
                                    }
                                } else if (button == 'cancel') {
                                    return;
                                }
                            }.bind(this), null, null, '');
                        }.bind(this),
                        iconCls: 'pimcore_icon_add'
                    }
                ]
            }]
        });

        return this.transitionsPanel;
    },

    getGlobalActionsPanel: function () {
        this.globalActionsPanel = new Ext.Panel({
            border: false,
            autoScroll: true,
            title: t('workflow_settings_global_actions'),
            iconCls: 'pimcore_icon_settings',
            padding: 10,
            items: [{
                xtype: 'grid',
                title: t('workflow_global_actions'),
                margin: '0 0 15 0',
                store: this.globalActionsStore,
                columns: [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'id',
                        text: t('workflow_global_action_id'),
                        flex: 1
                    },
                    {
                        menuDisabled: true,
                        sortable: false,
                        xtype: 'actioncolumn',
                        width: 60,
                        items: [{
                            iconCls: 'pimcore_icon_edit',
                            tooltip: t('edit'),
                            handler: function (grid, rowIndex, colIndex) {
                                new pimcore.plugin.workflow.global_action(this.globalActionsStore, this.placesStore, grid.store.getAt(rowIndex));
                            }.bind(this)
                        }, {
                            iconCls: 'pimcore_icon_delete',
                            tooltip: t('delete'),
                            handler: function (grid, rowIndex, colIndex) {
                                grid.store.removeAt(rowIndex);
                            }.bind(this)
                        }]
                    },
                ],
                tbar: [
                    {
                        text: t('add'),
                        handler: function (btn) {
                            Ext.MessageBox.prompt(t('workflow_global_action_id'), t('workflow_enter_global_action_id'), function (button, value) {
                                if (button === 'ok') {
                                    if (this.transitionStore.getById(value)) {
                                        Ext.Msg.alert(t('workflow_global_action_id'), t('workflow_global_action_with_id_already_exists'));
                                        return;
                                    }

                                    if (value.match(/^[a-zA-Z_]+$/)) {
                                        var record = new WorkflowGUI.Transition({
                                            id: value
                                        });

                                        this.globalActionsStore.add(record);

                                        new pimcore.plugin.workflow.global_action(this.globalActionsStore, this.placesStore, record);
                                    }
                                    else {
                                        Ext.Msg.alert(t('workflow_global_action_id'), t('workflow_problem_creating_workflow_invalid_characters'));
                                    }
                                } else if (button == 'cancel') {
                                    return;
                                }
                            }.bind(this), null, null, '');
                        }.bind(this),
                        iconCls: 'pimcore_icon_add'
                    }
                ]
            }]
        });

        return this.globalActionsPanel
    },

    getVisualizationPanel: function () {
        this.visualizationPanel = new Ext.Panel({
            title: t('Visualization'),
            icon: '/bundles/pimcoreadmin/img/flat-color-icons/tree_structure.svg',
            border: false,
            layout: 'fit',
            tbar: [{
                xtype: 'button',
                text: t('open_in_new_window')+' / '+t('download'),
                handler: function () {
                    window.open('/admin/workflow/visualizeImage?workflow=' + this.id + '');
                }.bind(this)
            }],
            items: [{
                html: '<iframe src="/admin/workflow/visualize?workflow='+this.id+'" width="100%" height="100%" frameborder="0"></iframe>',
                autoHeight: true
            }]
        });

        return this.visualizationPanel;
    },

    save: function () {
        if (!this.validate()) {
            Ext.Msg.alert(t('workflow_invalid'), t('workflow_invalid_detail'));
            return;
        }

        var data = this.getData();
        var newId = data['id'];

        delete data['id'];

        Ext.Ajax.request({
            url: '/admin/workflow/save',
            method: 'post',
            params: {
                data: Ext.encode(data),
                newId: newId,
                id: this.id
            },
            success: function(transport) {
                var response = Ext.decode(transport.responseText);

                if (response) {
                    if (response.success) {
                        this.id = newId;
                        this.saveOnComplete(this);
                    }
                    else {
                        Ext.Msg.alert(t('workflow_invalid'), response.message);
                    }
                }
                else {
                    Ext.Msg.alert(t('workflow_invalid'), t('workflow_unknown_error'));
                }
            }.bind(this)
        });
    },

    clone: function () {
        var me = this,
            id = this.id;

        this.panel.setLoading(t('loading'));

        Ext.MessageBox.prompt(t('workflow_gui_clone'), t('workflow_enter_the_name'), function(button, value) {
            if (button === 'ok' && value.length > 1) {
                Ext.Ajax.request({
                    url: '/admin/workflow/clone',
                    method: 'post',
                    params: {
                        name: value,
                        id: id
                    },
                    success: function(transport) {
                        me.panel.setLoading(false);

                        var response = Ext.decode(transport.responseText);

                        if (response) {
                            if (response.success) {
                                me.parentPanel.openWorkflow(value);
                            }
                            else {
                                Ext.Msg.alert(t('workflow_invalid'), response.message);
                            }
                        }
                        else {
                            Ext.Msg.alert(t('workflow_invalid'), t('workflow_unknown_error'));
                        }
                    }.bind(this)
                });
            } else {
                Ext.Msg.alert(t('workflow_add'), t('workflow_problem_creating_workflow'));
            }
        }, null, null, '');
    },

    validate: function () {
        var valid = true;

        valid &= this.settingsPanelForm.isValid();
        valid &= this.supportPanelDetailPanel.isValid();

        return valid;
    },

    getData: function () {
        var settingsData = this.settingsPanelForm.getForm().getFieldValues();
        var markingStoreData = this.markingStorePanel.getForm().getFieldValues();
        var auditTrailSettings = this.auditTrailPanel.getForm().getFieldValues();

        var data = settingsData;

        if (markingStoreData['service']) {
            delete markingStoreData['type'];
        } else {
            markingStoreData['arguments'] = this.settingsPanel.down('#markingStoreArgumentsGrid').getStore().getRange().map(function (record) {
                return record.get('argument');
            });

            if (markingStoreData['arguments'].length === 0) {
                delete markingStoreData['arguments'];
            }

            delete markingStoreData['service'];
        }

        data['audit_trail'] = auditTrailSettings;
        data['marking_store'] = markingStoreData;

        if (this.supportsPanel.down('#supportStrategy').getValue() === 'simple') {
            data['supports'] = this.supportPanelDetailPanel.getData();
        } else {
            data['support_strategy'] = this.supportPanelDetailPanel.getData();
        }

        var places = {};

        this.placesStore.getRange().forEach(function (record) {
            var place = Ext.clone(record.data);
            var id = record.getId();

            delete place['id'];

            places[id] = place;
        });

        var transitions = {};

        this.transitionStore.getRange().forEach(function (record) {
            var transition = Ext.clone(record.data);
            var id = record.getId();

            delete transition['id'];

            transitions[id] = transition;
        });

        var globalActions = {};

        this.globalActionsStore.getRange().forEach(function (record) {
            var globalAction = Ext.clone(record.data);
            var id = record.getId();

            delete globalAction['id'];

            globalActions[id] = globalAction;
        });

        data['id'] = data['name'];
        data['places'] = places;
        data['transitions'] = transitions;
        data['globalActions'] = globalActions;

        delete data['name'];

        return data;
    },

    saveOnComplete: function () {
        this.parentPanel.grid.getStore().load();

        pimcore.helpers.showNotification(t('success'), t('workflow_saved_successfully'), 'success');
    },

    activate: function () {
        this.parentPanel.getEditPanel().setActiveTab(this.panel);
    }
});
