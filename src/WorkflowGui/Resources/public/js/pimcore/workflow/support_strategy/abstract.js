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

pimcore.registerNS('pimcore.plugin.workflow.support_strategy.abstract');
pimcore.plugin.workflow.support_strategy.abstract = Class.create({
    getSettingsForm: function (id, data) {
        this.form = new Ext.form.Panel({
            defaults: {
                width: '100%',
                labelWidth: 200
            },
            items: this.getSettingsItems(id, data)
        });

        return this.form;
    },

    isValid: function() {
        return this.form.isValid();
    },

    getData: function () {
        return this.getFormData(this.form);
    },
});
