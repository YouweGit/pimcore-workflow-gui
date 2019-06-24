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

pimcore.registerNS('pimcore.plugin.workflow.panel');
pimcore.plugin.workflow.panel = Class.create({

    initialize: function () {
        this.panels = {};
        this.getTabPanel();
    },

    getTabPanel: function () {

        if (!this.panel) {
            this.panel = new Ext.Panel({
                id: 'pimcore_workflows',
                title: t('workflows'),
                iconCls: 'pimcore_icon_workflow_action',
                border: false,
                layout: 'border',
                closable: true,
                items: [this.getWorkflowTree(), this.getEditPanel()]
            });

            this.panel.on('destroy', function () {
                pimcore.globalmanager.remove('workflows');
            }.bind(this));

            var tabPanel = Ext.getCmp('pimcore_panel_tabs');
            tabPanel.add(this.panel);
            tabPanel.setActiveItem('pimcore_workflows');

            this.panel.updateLayout();
            pimcore.layout.refresh();
        }

        return this.panel;
    },

    getWorkflowTree: function () {
        if (!this.grid) {
            var store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/admin/workflow/list',
                    reader: {
                        type: 'json',
                        fields: [{
                            name: 'id'
                        }]
                    }
                }
            });

            this.grid = Ext.create('Ext.grid.Panel', {
                store: store,
                region: 'west',
                autoScroll: true,
                animate: false,
                containerScroll: true,
                width: 200,
                split: true,
                listeners: this.getGridListeners(),
                hideHeaders: true,
                columns: [{
                    dataIndex: 'id',
                    flex: 1,
                }],
                tbar: {
                    items: [
                        {
                            text: t('workflow_add'),
                            iconCls: 'pimcore_icon_add',
                            handler: this.addField.bind(this)
                        }
                    ]
                }
            });
        }

        return this.grid;
    },

    getGridListeners: function () {
        var treeNodeListeners = {
            'itemclick': this.onTreeNodeClick.bind(this),
            'itemcontextmenu': this.onTreeNodeContextmenu.bind(this),
            'beforeitemappend': function (thisNode, newChildNode, index, eOpts) {
                newChildNode.data.qtip = t('id') + ': ' + newChildNode.data.id;
            }
        };

        return treeNodeListeners;
    },

    getEditPanel: function () {
        if (!this.editPanel) {
            this.editPanel = new Ext.TabPanel({
                activeTab: 0,
                items: [],
                region: 'center'
            });
        }

        return this.editPanel;
    },

    openWorkflow: function (id) {
        try {
            var workflowPanelKey = 'workflow_' + id;
            if (this.panels[workflowPanelKey]) {
                this.panels[workflowPanelKey].activate();
            } else {
                Ext.Ajax.request({
                    url: '/admin/workflow/get',
                    params: {
                        id: id
                    },
                    success: function (response) {
                        var data = Ext.decode(response.responseText);

                        if (!data || !data.success) {
                            Ext.Msg.alert(t('workflow_add'), t('workflow_problem_opening_workflow'));
                        } else {
                            var workflowPanel = new pimcore.plugin.workflow.item(id, data.data, this, workflowPanelKey);
                            this.panels[workflowPanelKey] = workflowPanel;
                        }
                    }.bind(this)
                });
            }
        } catch (e) {
            console.log(e);
        }

    },

    onTreeNodeClick: function (tree, record, item, index, e, eOpts) {
        this.openWorkflow(record.data.id);
    },

    addField: function () {
        Ext.MessageBox.prompt(t('workflow_add'), t('workflow_enter_the_name'),
            this.addFieldComplete.bind(this), null, null, '');
    },

    onTreeNodeContextmenu: function (tree, record, item, index, e, eOpts) {
        e.stopEvent();

        tree.select();

        var menu = new Ext.menu.Menu();
        menu.add(new Ext.menu.Item({
            text: t('delete'),
            iconCls: 'pimcore_icon_delete',
            handler: this.deleteField.bind(this, tree, record)
        }));


        menu.showAt(e.pageX, e.pageY);
    },

    addFieldComplete: function (button, value, object) {
        if (button === 'ok' && value.length > 1) {
            if (value.match(/^[a-zA-Z_]+$/)) {
                new pimcore.plugin.workflow.item(value, {}, this);
            }
            else {
                Ext.Msg.alert(t('workflow_add'), t('workflow_problem_creating_workflow_invalid_characters'));
            }
        } else if (button == 'cancel') {

        } else {
            Ext.Msg.alert(t('workflow_add'), t('workflow_problem_creating_workflow'));
        }
    },

    deleteField: function (grid, record) {
        Ext.Ajax.request({
            url: '/admin/workflow/delete',
            method: 'post',
            params: {
                id: record.data.id
            }
        });

        this.getEditPanel().removeAll();

        grid.store.remove(record);
    },

    activate: function () {
        Ext.getCmp('pimcore_panel_tabs').setActiveItem('pimcore_workflows');
    }
});





