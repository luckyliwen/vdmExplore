sap.ui.controller("he.controller.UnitTest", {

    onInit: function() {

        //The main view can open/close other workset, so it need listen to the view related events

        //he.bus.subscribe("view", "NewView", this.onNewView,  this);
        this.view = this.getView();
    },

    onAfterDoInit: function() {
    }

});
