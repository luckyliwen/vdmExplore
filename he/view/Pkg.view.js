jQuery.sap.declare("he.view.Pkg");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("he.view.Pkg", {
    metadata: {
        properties: {

        }
    },

    // Just reuse the JSView is enough
    renderer: 'sap.ui.core.mvc.JSViewRenderer',

    getControllerName: function() {
        return "he.controller.Pkg";
    },

    _createPkgTree: function(oController) {
        // var t = new sap.ui.commons.Tree(this.createId('PkgTree'), 
        var t = new he.uilib.HanaTree(this.createId('PkgTree'), {
            height: '1000px', //??tmp
            //height: '100%', //??tmp
            title: "HANA",
            showHorizontalScrollbar: true,
        });
        t.doInit();
        return t;
    },

    _createHanaTreeToolBar: function(oControl) {

        var addBtn = new sap.ui.commons.Button(this.createId('HanaTreeAddPkgBtn'), {
            text: "Add Package"
        });


        var delBtn = new sap.ui.commons.Button(this.createId('HanaTreeDelBtn'), {
            text: "Del"
        });

        var openBtn = new sap.ui.commons.Button(this.createId('HanaTreeOpenFilesBtn'), {
            text: 'Load Files...'
        });


        var fileChoose = new he.uilib.FileChoose(this.createId('HanaTreeOpenFilesFileChoose'), {
            buttonControl: openBtn,
            //accept : 'text/',
            multiple: true,
        });


        var toolbar = new sap.ui.commons.Toolbar({
            items: [addBtn, delBtn, fileChoose]
        });
        return toolbar;
    },

    _createLeftTreePart: function(oController) {
        var treeToolbar = this._createHanaTreeToolBar(oController);
        
        var tree = this._createPkgTree(oController);

        return new sap.ui.layout.VerticalLayout({
            //width:  '360px',  //as the toolbar can't show full
            width: '100%',
            content: [treeToolbar,tree]
        });
    },


  _createVdmTreeToolBar: function(oControl) {

        var pairBtn = new sap.ui.commons.Button(this.createId('VdmTreeGoPariBtn'), {
            text: "Pair",
            enabled: false,
        });

/*        var filterBtn = new sap.ui.commons.Button(this.createId('VdmTreeMarkFilterBtn'), {
            text: "Mark Filter",
            enabled: false,
        });

        var calcBtn = new sap.ui.commons.Button(this.createId('VdmTreeMarkCalcColumnBtn'), {
            text: "Mark Calculated Column",
            enabled: false,
        });

        var clearBtn = new sap.ui.commons.Button(this.createId('VdmTreeClearMarkBtn'), {
            text: "Clear Mark",
            enabled: false,
        });
*/
        var toolbar = new sap.ui.commons.Toolbar({
            items: [pairBtn,/*filterBtn,calcBtn,clearBtn*/]
        });
        return toolbar;
    },

    _createVdmTreePart: function(oController) {
        var tree = new  he.uilib.VdmTree(this.createId('VdmTree'), {   
            height: '1000px', //??tmp
            //width: '100%',
            title: "VDM",
            showHorizontalScrollbar: true,
        });
        tree.doInit();
        
        var toolbar = this._createVdmTreeToolBar(oController);
        
        var vbox = new sap.ui.layout.VerticalLayout({
            width: "100%",
            content : [ toolbar, tree ]
            });

        return vbox;
    },

    _createAttrTableToolBar: function(oControl) {
        var trackBtn = new sap.ui.commons.Button( this.createId('VdmTrackPath'), 
                {
                    text: "Track Path",
                    enabled: false,
                });
        
        var clearBtn = new sap.ui.commons.Button( this.createId('VdmClearTrack'), 
                {
                    text: "Clear Track",
                    enabled: false,
                });

        
        var analysBtn = new sap.ui.commons.Button( this.createId('VdmAdvancedAnalysis'), 
                {
                    text: "Advanced Analysis",
                    enabled: false,
                });
        analysBtn.addStyleClass("MarginLeft_2em");
        
        /*var exportBtn = new sap.ui.commons.Button( this.createId('VdmExport'), 
                {
                    enabled: false,
                    text: "Export"
                });
        exportBtn.addStyleClass("MarginLeft_2em");*/

        //now just show filter in open dialog
        var filterBtn = new sap.ui.commons.Button( this.createId('VdmFilterExpressionBtn'), 
                {
                    text: "Filter Expression",
                    enabled: false,
                });
        filterBtn.addStyleClass("MarginLeft_2em");

        var toolbar = new sap.ui.commons.Toolbar({
            items: [  
                trackBtn, clearBtn, analysBtn, filterBtn
            ]
        });
        return toolbar;

    },
    /*aggr: ""
filter: null
isCalc: false
isJoin: false
name: "SAPClient"
srcName0: "SAPClient"
srcNode0: "Union_1"
*/
    _createAttrTable: function(oController) {
/*        var colSrcNode0 = new sap.ui.table.Column({
            // label: "Input A",
            label: new sap.ui.commons.Label({
                text: "Input A",
                design: 'Bold',
                }),
            template: new sap.ui.commons.TextView({
                text: "{i0}"
            }),
            sortProperty: "i0",
            filterProperty: "i0",
        });
*/
        var colSrcName0 = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Source A",
                design: 'Bold',
                }),
            template: new sap.ui.commons.TextView({
                text: {
                    path: 'n0',
                    formatter: function(v) {
                        if (v !== "") {
                            var context = this.getBindingContext();
                            if (context) {
                                var map = context.getProperty('map');
                                if (map) {
                                    this.setSemanticColor('Positive');
                                } else {
                                    this.setSemanticColor('Default');
                                }
                            }
                        }
                        return v;
                    }
                },
            }),
            sortProperty: "n0",
            filterProperty: "n0",
        });

/*        var colSrcNode1 = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Input B",
                design: 'Bold',
                }),
            template: new sap.ui.commons.TextView({
                text: "{i1}"
            }),
            sortProperty: "i1",
            filterProperty: "i1",
        });
*/
        var colSrcName1 = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Source B",
                design: 'Bold',
                }),

            template: new sap.ui.commons.TextView({
                text: {
                    path: 'n1',
                    formatter: function(v) {
                        if (v !== "") {
                            var context = this.getBindingContext();
                            if (context) {
                                var map = context.getProperty('map');
                                if (map) {
                                    this.setSemanticColor('Positive');
                                } else {
                                    this.setSemanticColor('Default');
                                }
                            }
                        }
                        return v;
                    }
                }
            }),
            sortProperty: "n1",
            filterProperty: "n1",
        });

        var colName = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Target",
                design: 'Bold',
                }),

            template: new sap.ui.commons.TextView({
                text: {
                    path: "name",
                    formatter: function(v) {
                        var context = this.getBindingContext();
                        if (context) {
                            var map = context.getProperty('map');
                            if (map) {
                                this.setSemanticColor('Critical');
                            } else {
                                    this.setSemanticColor('Default');
                            }
                        }
                        return v;
                    }
                }
            }),
            sortProperty: "name",
            filterProperty: "name",
        });

        var colDesc = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Description",
                design: 'Bold',
                }),

            template: new sap.ui.commons.TextView({
                text: "{desc}"
            }),
            sortProperty: "desc",
            filterProperty: "desc",
        });

        var colFilter = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Filter",
                design: 'Bold',
                }),

            template: new sap.ui.commons.TextView({
                text: "{filter}"
            }),
            sortProperty: "filter",
            filterProperty: "filter",
        });

/*        var colFormula = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Formula",
                design: 'Bold',
                }),

            template: new sap.ui.commons.TextView({
                text: "{fo}"
            }),
            sortProperty: "fo",
            filterProperty: "fo",
        });

        var colMap = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "Map",
                design: 'Bold',
                }),

            template: new sap.ui.commons.TextView({
                text: "{map}"
            }),
            sortProperty: "map",
            filterProperty: "map",
        });
*/
        // Filter:   7
        // Calc:     8
        // Extra:    9
        // 

        var aCols = [ colSrcName0, 
            colSrcName1, colName, colDesc,
            colFilter, 
            /*colFormula, colMap*/
        ];

        oController.setAttrTblCols(aCols);

        //this.createId("AttrTableTitle")
        var tableTitle  = new sap.ui.commons.TextView('AttrTableHeader',{
            text: "", 
            wrapping: false,
            width: "100%"
        });
        tableTitle.addStyleClass("sapUiTableHdrTitle");
        tableTitle.addStyleClass("PreservedSpace");

        var toolbar = this._createAttrTableToolBar();
        
        var oTable = new sap.ui.table.Table( this.createId('AttrTable'), 
        {
            // selectionMode: sap.ui.table.SelectionMode.Single,
            allowColumnReordering: true,
            showNoData: true,
            showColumnVisibilityMenu: true,
            enableGrouping:  true,

            toolbar: toolbar,
            title: tableTitle,
            columns: aCols,
            visibleRowCount: 30,
        });
        
        // //        [colName, colType, colEditor, colPath, colFormatter, colExtra],
        // var aWidth = [ 1,    1,       2,          2,     2,             2]; 
        // he.view.Helper.setTableColumnsWidth(oTable, aWidth); 

        return oTable;
    },

    onCalcExploredLinkPressed: function ( evt ) {
        var source = evt.getSource();
        var context = source.getBindingContext();
        var path = context.getPath();
        var arr = context.getModel().getData();
        var  pos  = path.lastIndexOf("/");
        var idx = parseInt( path.substr(pos+1));

        he.uilib.ExpressionDialog.showExpression(arr.aCalc, idx);
        //from the binding know which row it binding,     
        //
        // he.uilib.ExpressionDialog
    },

    _createCalcTable: function(oController) {
        var colId = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "id",
                design: 'Bold',
                }),
            template: new sap.ui.commons.TextView({
                text: {
                    path: 'id',
                }
            }),
            sortProperty: "id",
            filterProperty: "id",
        });

        var colDatatype = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "data type",
                design: 'Bold',
                }),
            template: new sap.ui.commons.TextView({
                text: {
                    path: 'datatype',
                }
            }),
            sortProperty: "datatype",
            filterProperty: "datatype",
        });

        var colDatatypeExtra = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "length",
                design: 'Bold',
                }),
            template: new sap.ui.commons.TextView({
                text: {
                    path: 'datatypeExtra',
                }
            }),
            sortProperty: "datatypeExtra",
            filterProperty: "datatypeExtra",
        });

    //as user need copy, so here use TextField
        var colExplore = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "explore",
                design: 'Bold',
                }),
            template: new sap.ui.commons.Link({
                text: 'explore', 
                press: [this.onCalcExploredLinkPressed, this]
            }),
        });

        //as user need copy, so here use TextField
        var colFormula  = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "formula",
                design: 'Bold',
                }),
/*            template: new sap.ui.commons.TextField({
                value: {
                    path: 'formula',
                }
            }),
*/ 
            template: new sap.ui.core.HTML({
                content: {
                    path: 'formula',
                    formatter: function(v) {
                        // console.error('value format',v);
                        if (v) {
                            var context = this.getBindingContext();
                            if (context) {
                                var attr = context.getProperty("");
                                if (! attr.expression) {
                                    attr.expression = he.util.ExpressionHelper.formatSimpleExpression( v);
                                } 
                                return attr.expression;    
                            }
                        }
                    }
                }
            }),

           sortProperty: "formula",
           filterProperty: "formula",
        });

        
        var tableTitle  = new sap.ui.commons.TextView('CalcTableHeader',{
            text: "", 
            wrapping: false,
            width: "100%"
        });
        tableTitle.addStyleClass("sapUiTableHdrTitle");
        tableTitle.addStyleClass("PreservedSpace");
        // var toolbar = this._createAttrTableToolBar();
        
        var oTable = new sap.ui.table.Table( this.createId('CalcTable'), 
        {
            // selectionMode: sap.ui.table.SelectionMode.Single,
            allowColumnReordering: true,
            showNoData: true,
            showColumnVisibilityMenu: true,
            enableGrouping:  true,

            // toolbar: toolbar,
            // title: tableTitle,
            columns: [ colId, colDatatype,colDatatypeExtra,colExplore, colFormula],
            // visibleRowCount: 30,  set dynamic
        });

        // //        [colId, colDatatype,colDatatypeExtra, colExplore, colFormula],
        var aWidth = [ 2,    1,           1,                1,          7]; 
        he.view.Helper.setTableColumnsWidth(oTable, aWidth); 

        return oTable;
    },

    _createVdmPropPart: function ( oController ) {
        //desc
        var lblDesc = new sap.ui.commons.Label({
            text: "Description:    ",
            design: 'Bold'
        });
        var desc = new sap.ui.commons.TextView(this.createId("VdmDesc"), {
            design: "H4",
            textAlign: "Center",
        });

        desc.addStyleClass('MarginLeftRight');
        var hBoxDesc = new sap.ui.layout.HorizontalLayout({
            content : [ lblDesc, desc]
            });

        //dep vdm
        var lblDepVdm = new sap.ui.commons.Label(this.createId("LabelDepVdm"),{
            text: "Depended Vdms:",
            design: 'Bold'
        });
        var hBoxDepVdm = new sap.ui.layout.HorizontalLayout(this.createId("HBoxDepVdm"),{
            content : [ lblDepVdm ]
            });

        //dep tbl
        var lblDepTbl = new sap.ui.commons.Label(this.createId("LabelDepTbl"),{
            text: "Depended Tables:",
            design: 'Bold'
        });
        var hBoxDepTbl = new sap.ui.layout.HorizontalLayout(this.createId("HBoxDepTbl"),{
            content : [ lblDepTbl ]
            });

        //input param
        var lblIP = new sap.ui.commons.Label(this.createId("LabelInputParam"),{
            text: "Input Parameters:",
            design: 'Bold'
        });
        var btnDetail = new sap.ui.commons.Button(this.createId("VdmInputParamDetail"),{
            text: "Show Details"
        });
        btnDetail.addStyleClass('MarginLeftRight');

        // lblIP.addStyleClass('MarginLeftRight');
        var hBoxIP = new sap.ui.layout.HorizontalLayout(this.createId("HBoxInputParam"),{
            content : [ lblIP, btnDetail ]
            });
        // hBoxDesc
        var vBox = new sap.ui.layout.VerticalLayout({
            content : [  hBoxDepVdm, hBoxDepTbl, hBoxIP ]
            });

        var panel = new sap.ui.commons.Panel(this.createId("VdmPanel"),{
               title: new sap.ui.commons.Title({text: "Properties"}), 
               content: vBox
        });
        return panel;

    },

    _createVdmExplore: function(oController) {
        var panel = this._createVdmPropPart(oController);
        var attrTable = this._createAttrTable(oController);

        //wrapp the CalcTable inside a panel
        var calcTable = this._createCalcTable(oController);
        var calcPanel = new sap.ui.commons.Panel(this.createId("CalcPanel"),{
               // title: new sap.ui.commons.Title({text: ""}), 
               content: calcTable
        });

        return new sap.ui.layout.VerticalLayout(this.createId("VBoxVdmProp"),{
            //width:  '360px',  //as the toolbar can't show full
            width: '100%',
            content: [panel, calcPanel, attrTable]
        });
    },

     _createRightPart: function(oController) {
        
        var tree = this._createVdmTreePart(oController);
        var explore = this._createVdmExplore(oController);

        //use a split 
        var split = new sap.ui.commons.Splitter(this.createId("RightSplitContent"), {
            splitterOrientation: sap.ui.commons.Orientation.Vertical,
            splitterPosition: "30%",
            minSizeFirstPane: "10%",
            minSizeSecondPane: "10%",
            width: "100%",
            height: "100%",

            firstPaneContent: tree,
            secondPaneContent: explore,
        });

        return split;
    },

    doInit: function() {
        var oController = this.getController();

        var left = this._createLeftTreePart(oController);
        var right = this._createRightPart(oController);

        //use a split 
        this._oSplit = new sap.ui.commons.Splitter(this.createId("SplitContent"), {
            splitterOrientation: sap.ui.commons.Orientation.Vertical,
            splitterPosition: "20%",
            minSizeFirstPane: "10%",
            minSizeSecondPane: "10%",
            width: "100%",
            height: "100%",

            firstPaneContent: left,
            secondPaneContent: right,
        });

        this.addContent(this._oSplit);

        //then manually call the oController init work
        this.getController().onAfterDoInit();
    },

    createContent: function(ooController) {
        return null;
    },
});
