var ga;
sap.ui.controller("he.controller.Analyze", {

    onInit: function() {

        //The main view can open/close other workset, so it need listen to the view related events

        //he.bus.subscribe("view", "NewView", this.onNewView,  this);
        this.view = this.getView();
    },
    
    onAfterRendering: function ( evt ) {
        he.util.expandTreeTable(this.treeTable);
    },

    onAfterDoInit: function() {
        this.treeTable = this.byId("AnalyzeTreeTable");
        //??later check why not work       
/*        var binding = this.treeTable.getBinding('rows');
        binding.attachDataReceived( this.onTreeTableDataReceived, this);
*/
        ga = this;
    },

    onTreeTableDataReceived: function ( evt ) {
        he.util.expandTreeTable(this.treeTable);
    },

    treeTable: null, 

});
