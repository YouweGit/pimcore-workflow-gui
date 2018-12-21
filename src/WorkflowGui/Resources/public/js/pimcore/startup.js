pimcore.registerNS("pimcore.plugin.WorkflowGuiBundle");

pimcore.plugin.WorkflowGuiBundle = Class.create(pimcore.plugin.admin, {
    getClassName: function () {
        return "pimcore.plugin.WorkflowGuiBundle";
    },

    initialize: function () {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function (params, broker) {
        // alert("WorkflowGuiBundle ready!");
    }
});

var WorkflowGuiBundlePlugin = new pimcore.plugin.WorkflowGuiBundle();
