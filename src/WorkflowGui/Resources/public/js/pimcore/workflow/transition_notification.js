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

pimcore.registerNS('pimcore.plugin.workflow.transition_notification');
pimcore.plugin.workflow.transition_notification = Class.create({
    initialize: function (notificationStore, notification) {
        this.notificationStore = notificationStore;

        this.window = new Ext.window.Window({
            title: t('workflow_transition_notification'),
            items: this.getSettings(notification),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 600,
            height: 500
        });

        this.window.show();
    },

    getUserCombobox: function (value) {
        var store = new Ext.data.Store({
            proxy: {
                type: 'ajax',
                url: '/admin/user/search',
                reader: {
                    type: 'json',
                    rootProperty: 'users'
                }
            },
            fields: ["id", 'name', "email", "firstname", "lastname"]
        });
        store.load();

        var resultTpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-boundlist-item" style="font-size: 11px;line-height: 15px;padding: 3px 10px 3px 10px; border: 1px solid #fff; border-bottom: 1px solid #eeeeee; color: #555;">',
            '<img style="float:left; padding-right: 10px; max-height:30px;" src="/admin/user/get-image?id={id}" />',
            '<h3 style="font-size: 13px;line-height: 16px;margin: 0;">{name} - {firstname} {lastname}</h3>',
            '{email} <b>ID: </b> {id}',
            '</div></tpl>'
        );

        return Ext.create('Ext.form.ComboBox', {
            store: store,
            name: 'notifyUsers',
            displayField: 'name',
            valueField: 'id',
            loadingText: t('searching'),
            fieldLabel: t('workflow_transition_notification_notify_users'),
            minChars: 1,
            tpl: resultTpl,
            triggerAction: 'all',
            multiple: true,
            value: value,
            listeners: {
                afterrender: function () {
                    this.focus(true, 500);
                }
            }
        });
    },

    getRolesCombobox: function (value) {
        var store = new Ext.data.Store({
            proxy: {
                type: 'ajax',
                url: '/admin/workflow/roles/search',
                reader: {
                    type: 'json',
                    rootProperty: 'roles'
                }
            },
            fields: ["id", 'name']
        });
        store.load();

        var resultTpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-boundlist-item" style="font-size: 11px;line-height: 15px;padding: 3px 10px 3px 10px; border: 1px solid #fff; border-bottom: 1px solid #eeeeee; color: #555;">',
            '<h3 style="font-size: 13px;line-height: 16px;margin: 0;">{name}</h3>',
            '<b>ID: </b> {id}',
            '</div></tpl>'
        );

        return Ext.create('Ext.form.ComboBox', {
            store: store,
            name: 'notifyRules',
            displayField: 'name',
            valueField: 'id',
            loadingText: t('searching'),
            fieldLabel: t('workflow_transition_notification_notify_roles'),
            minChars: 1,
            tpl: resultTpl,
            triggerAction: 'all',
            multiple: true,
            value: value,
            listeners: {
                afterrender: function () {
                    this.focus(true, 500);
                }
            }
        });
    },

    getSettings: function (notification) {
        this.settingsForm = new Ext.form.Panel({
            bodyStyle: 'padding:20px 5px 20px 5px;',
            border: false,
            autoScroll: true,
            forceLayout: true,
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'condition',
                    value: notification.get('condition'),
                    fieldLabel: t('workflow_transition_notification_condition'),
                    allowBlank: false,
                },
                this.getUserCombobox(notification.get('notifyUsers')),
                this.getRolesCombobox(notification.get('notifyRoles')),
                {
                    xtype: 'combobox',
                    fieldLabel: t('workflow_transition_notification_mail_type'),
                    name: 'mailType',
                    store: Ext.data.ArrayStore({
                        fields: ['type'],
                        data: [
                            ['template'],
                            ['pimcore_document'],
                        ]
                    }),
                    value: notification.get('mailType') ? notification.get('mailType') : 'template',
                    displayField: 'type',
                    valueField: 'type',
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    fieldLabel: t('workflow_transition_notification_mail_path'),
                    name: 'mailPath',
                    value: notification.get('mailPath'),
                }
            ],
            buttons: [
                {
                    text: t('save'),
                    handler: function (btn) {
                        if (this.settingsForm.isValid()) {
                            var formValues = this.settingsForm.getForm().getFieldValues();

                            notification.set(formValues);
                            notification.commit();

                            this.notificationStore.add(notification);

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
