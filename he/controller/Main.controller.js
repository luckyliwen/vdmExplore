sap.ui.controller("he.controller.Main", {

    onInit: function() {

        //The main view can open/close other workset, so it need listen to the view related events

        //he.bus.subscribe("view", "NewView", this.onNewView,  this);
        this.view = this.getView();
        
        he.bus.subscribe("Main", "NewAnalyze", this.onNewAnalyze,  this);
    },

    onSettingPressed: function() {
        b.attachPress(this.onValueChangeded, this);
        b.attachPress(this.onfuncChangeded, this);
        b.attachPress(this.onfuncPressed, this);
    },


    onHelpPressed: function() {

    },
    
    onNewAnalyze: function (channel, event, data ) {
        this.view.createNewAnalyze(data);
    },

    /**
     * Active the view means switch to the corresponding view
     * @param viewName
     */
    activateViewById: function(id) {
        he.byId(id).setVisible(true);

        this.view.activateView(id);
    },

});
