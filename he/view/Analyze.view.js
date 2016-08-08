jQuery.sap.declare("he.view.Analyze");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("he.view.Analyze", {
    metadata: {
        properties: {

        }
    },

    // Just reuse the JSView is enough
    renderer: 'sap.ui.core.mvc.JSViewRenderer',

    getControllerName: function() {
        return "he.controller.Analyze";
    },

    createContent: function(oController) {
        return null;
    },

 /* data like var m = {
            title: title,
            modelData: modelData,
            aHead:  aName,
        };*/
    doInit: function(data) {
        //then manually call the oController init work
        var table = this.createAnalyzeTable(data.aHead, data.modelData);
        this.addContent(table);

        this.getController().onAfterDoInit();
    },

    /**
     * 
     * @param  {[type]} aHead [description]
     * @param  {[type]} data  data: used for binding
     * @return {[type]}       [description]
     */
    createAnalyzeTable: function ( aHead , modelData) {
        var aCol = [];
        //add icon later , also the semantic color later 
        var colName = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Node",
                design: 'Bold',
                }),            
            template: new sap.ui.commons.TextView({
                text: {
                    'path': 'name'
                }
            }),
        });
        aCol.push(colName);

        for (var i = 0; i < aHead.length; i++) {
            var head = aHead[ i ] ; 
            var path = 'n' + i;

            var col = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                   text: head,
                   design: 'Bold',
                }),            

                template: new sap.ui.commons.TextView({
                    text: {
                        'path': path
                    }
                }),
                filterProperty: path,
            });

            aCol.push(col);
        }

        var oTable = new sap.ui.table.TreeTable( this.createId('AnalyzeTreeTable'), 
        {
            width: '100%',
            // selectionMode: sap.ui.table.SelectionMode.Single,
            allowColumnReordering: true,
            showNoData: true,
            showColumnVisibilityMenu: true,
            // enableGrouping:  true,

            // toolbar: toolbar,
            // title: tableTitle,
            columns: aCol,
            // toolbar: toolbar,
            visibleRowCount: 40,
            expandFirstLevel: true,
        });

        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(modelData);
        oTable.setModel( oModel);
        oTable.bindRows("/" );

        // //        [colName, colType, colEditor, colPath, colFormatter, colExtra],
        // var aWidth = [ 1,    1,       2,          2,     2,             2]; 
        // he.view.Helper.setTableColumnsWidth(oTable, aWidth); 

        return oTable;
    },

});
