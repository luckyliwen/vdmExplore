jQuery.sap.declare("he.view.UnitTest");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("he.view.UnitTest", {
    metadata: {
        properties: {

        }
    },

    // Just reuse the JSView is enough
    renderer: 'sap.ui.core.mvc.JSViewRenderer',

    getControllerName: function() {
        return "he.controller.UnitTest";
    },
    createContent: function(ooController) {
        return null;
    },

    doInit: function() {
        var oController = this.getController();

        var tv = new sap.ui.commons.TextView({
        	text: "Comming soon!",
        	design: 'H1'
        });
        this.addContent(tv);
        //then manually call the oController init work
        this.getController().onAfterDoInit();
    },

});
