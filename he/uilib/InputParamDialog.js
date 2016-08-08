he.uilib.InputParamDialog = {

    showDetail: function(aInfo) {
        if (this._oDialog === null) {
            this._createDialog();
        }

        this._setTableContent(aInfo);
        this._oDialog.open();
    },

    _setTableContent: function(aInfo) {
        this._oTable.setVisibleRowCount( aInfo.length);
        this._jsonModel.setData(aInfo);
        this._oTable.bindRows('/');
    },

/*defaultValue: " "
desc: "Key Date"
length: "8"
mandatory: true
name: "P_KeyDate"
type: "NVARCHAR"
uri: ""
*/
    _createTable: function() {
        var aColInfo = [
            {label:'Name',  prop: 'name' ,  width: 2 },
            {label:'Description',  prop: 'desc', width: 3},
            {label:'Type',  prop: 'type' ,  width: 1},
            {label:'Length',  prop: 'length', width: 1},
            {label:'Default Value',  prop: 'defaultValue', width: 2},
            {label:'Mandatory',  prop: 'mandatory',  width: 1},
            {label:'Mapping',  prop: 'mapping',  width: 4},
        ];

        var aCol = [];
        var aWidth=[];
        aColInfo.forEach( function( data) {
            aCol.push( new sap.ui.table.Column(
                {
                    label:  new sap.ui.commons.Label({
                        text: data.label,
                        design: 'Bold',
                    }),
                    template: data.prop
                })
            ); 

            aWidth.push( data.width);
        });
        
        var oTable = new sap.ui.table.Table({
            columns: aCol,
            }
        );

        he.view.Helper.setTableColumnsWidth(oTable, aWidth); 

        return oTable;
    },

    _createDialog: function() {
        var that = this;
        var closeBtn = new sap.m.Button({
            text: 'Close',
            press: function() {
                that._oDialog.close();
            }
        });

        var title = new sap.m.Label({
            text: 'Input Parameter Information',            
            design: 'Bold'
        });
        this._oTable = this._createTable();

        this._oDialog = new sap.m.Dialog({
            title:       'Input Parameter Information',
            content:  this._oTable, 
            'endButton': closeBtn,
        });
    
        this._jsonModel = new sap.ui.model.json.JSONModel();
        this._oTable.setModel(this._jsonModel);
    },

    _oDialog: null,
    _oTable: null, 
    _jsonModel: null 
};
