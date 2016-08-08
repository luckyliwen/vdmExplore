var gpkg;
sap.ui.controller("he.controller.Pkg", {


    /**
     * In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
     */
    onAfterDoInit: function() {
        this.vdmTree = this.byId("VdmTree");
        this.hanaTree = this.byId("PkgTree");
        this.attrTbl = this.byId("AttrTable");
        this.calcTbl = this.byId("CalcTable");

        this.prepareVdmTree();
        this.prepareAttrTbl();
        this.prepareCalcTbl();

        this.lblVdmDesc = this.byId("VdmDesc");
        this.hboxDepVdm = this.byId("HBoxDepVdm");
        this.hboxDepTbl = this.byId("HBoxDepTbl");
        this.vdmPanel = this.byId("VdmPanel");
        this.calcPanel = this.byId("CalcPanel");
        
        this.vboxVdmProp = this.byId("VBoxVdmProp");
        this.hboxInputParam = this.byId("HBoxInputParam");
         
        // this.byId("VdmSelectAll").attachPress(this.onVdmSelectUnselectPressed, this);
        // this.byId("VdmUnselectAll").attachPress(this.onVdmSelectUnselectPressed, this);

        this.byId("VdmTreeGoPariBtn").attachPress(this.onVdmTreeGoPairPressed, this);
        this.byId("VdmTrackPath").attachPress(this.onVdmTrackPathPressed, this);
        this.byId("VdmClearTrack").attachPress(this.onVdmClearTrackPressed, this);
        this.byId("VdmAdvancedAnalysis").attachPress(this.onVdmAdvanceAnalysisPressed, this);
        // this.byId("VdmExport").attachPress(this.onVdmExportPressed, this);
        this.byId("VdmFilterExpressionBtn").attachPress(this.onVdmFilterExpressionBtnPressed, this);

        this.byId("VdmInputParamDetail").attachPress(this.onVdmInputParamDetailPressed, this);
        this.attrTbl.attachRowSelectionChange( this.onAttrRowSelectionChanged, this);

        this.byId("HanaTreeAddPkgBtn").attachPress(this.onHanaTreeAddPkgPressed, this);
        this.byId("HanaTreeDelBtn").attachPress(this.onHanaTreeDelPressed, this);
        this.hanaOpenFileChoose = this.byId("HanaTreeOpenFilesFileChoose");

        this.hanaOpenFileChoose.attachChange(this.onHanaOpenFileChooseChanged,  this);
        this.hanaOpenFileChoose.attachLoadAll(this.onHanaLoadAllFileFinished, this);

        this.vdmTree.attachSelect( this.onVdmNodeSelectionChanged, this );
        this.hanaTree.attachSelect( this.onHanaNodeSelectionChanged, this );

        var content = he.model.VdmMng.getContent();
        for ( var pkg in content) {
            var mPkg = content[pkg];

            //first build the pkg
            var pkgNode = this.hanaTree.addPkg(pkg);

            for (var vdmName in mPkg) {
                var vdmData = mPkg[vdmName];
                this.hanaTree.addVdmUnderPkgNode(pkgNode, vdmName, vdmData);    
            }
        }
        gpkg = this;
    },    

    updateAttrTblButtonStatus: function ( evt ) {
        var aSel  = this.attrTbl.getSelectedIndices();
        var numSel = aSel.length;

        this.byId("VdmTrackPath").setEnabled ( numSel == 1 );
        this.byId("VdmAdvancedAnalysis").setEnabled ( numSel >= 1 );
        //??how to remembe Tracking hisotry
    },


    onAttrRowSelectionChanged: function ( evt ) {
        this.updateAttrTblButtonStatus(evt);
    },

    onHanaOpenFileChooseChanged:function ( evt ) {
        if (! evt.getSource().hasFile() ) {
            return;
        }

        //save the current folder so can read it later
        this.nodeOfAddVdm = this.hanaTree.getSelection();
        if (this.nodeOfAddVdm)
            this.hanaOpenFileChoose.startRead();
    },

    onHanaLoadAllFileFinished:function ( evt ) {
        var aContent = evt.getParameter("contents");
        var aName = evt.getParameter("names");
        var aErr = [];

        var fullPkgName = this.hanaTree.getFullPkgName( this.nodeOfAddVdm );

        for (var i = 0; i < aContent.length; i++) {
            var content = aContent[ i ] ; 
            var name  =  aName[i];
            var vdmName = he.util.getVdmNameFromFileName(name);

            if (content instanceof Error) {
                var errStr = "Read file " + name + " error: " + content;
                aErr.push(errStr);
                continue;
            }

            //parse it
            try {
                var vdmData  = he.model.Vdm.parseVdmContent(content);
                
                //add to vdmMng and add to tree
                he.model.VdmMng.addVdm( fullPkgName, vdmName, vdmData);

                //add to tree
                this.hanaTree.addVdmUnderPkgNode(this.nodeOfAddVdm, vdmName, vdmData);
            } catch(err) {
                var errStr = "Parse file " + name + " error:" + err;
                aErr.push(errStr);
                //??
                continue;
            }
        }
        
        if (aErr.length) {
            if (aErr.length == aContent.length)
                he.uilib.Message.showErrors("Load all files error", aErr);
            else 
                he.uilib.Message.showErrors("Load some files error", aErr);
        } else {
            //just use the toast
            var msg = "Load all " + aContent.length + " files successful!";
            he.uilib.Message.showToast(msg);
        }
    },

    onHanaTreeAddPkgPressed: function ( evt ) {
        var parent = this.hanaTree.getSelection();
        if (parent) {
            var pkg = prompt('Please input the package name, like sap.hba.ecc or sap/hba/ecc');
            pkg = pkg.trim();
            if (pkg.length) {
                this.hanaTree.addComplexPkg(parent, pkg);
            }
        }
    },

    onHanaTreeDelPressed: function ( evt ) {
        var node = this.hanaTree.getSelection();
        if (node) {
            var parent = node.getParent();
            parent.removeNode(node);
        }
    },

    onVdmInputParamDetailPressed: function ( evt ) {
        he.uilib.InputParamDialog.showDetail(  this.curVdmData.aInputParam);
    },

    /*onVdmSelectUnselectPressed: function ( evt ) {
        var id = evt.getSource().getId();
        var clear = true;
        if ( id.sapEndWith('VdmSelectAll') 
            clear = false;

    },*/

    onVdmTrackPathPressed: function ( evt ) {
        var aSel = this.attrTbl.getSelectedIndices();
        if (aSel.length != 1) {
            he.assert( false, "TackPath status not ok");
            return;
        }

        var context  = this.attrTbl.getContextByIndex(aSel[0]);
        var name = context.getProperty("name");
        
        this.vdmTree.trackPath( name, this.curVdmData);    
        this.byId("VdmClearTrack").setEnabled ( true );
    },

    onVdmClearTrackPressed: function ( evt ) {
        this.vdmTree.clearTrack();
        evt.getSource().setEnabled ( false );
    },

    onVdmAdvanceAnalysisPressed:function ( evt ) {
        var aSel = this.attrTbl.getSelectedIndices();
        var aName = [];
        for (var i = 0; i < aSel.length; i++) {
             var context  = this.attrTbl.getContextByIndex(aSel[i]);
            var name = context.getProperty("name");
            aName.push(name);
        }

        var viewData = this.getCurViewData();
        var modelData = he.model.VdmMng.getCompactAnalyzeData(this.curVdmData, viewData, aName, false);
        var title = "Analyze " + this.curVdmData.name + ".";
        if ( he.isLogicNode(viewData.nodeType)) {
            title += 'logicModel';
        }  else {
            title += viewData.name;
        }

        var m = {
            title: title,
            modelData: modelData,
            aHead:  aName,
        };
        he.bus.publish("Main", "NewAnalyze", m);
    },

    onVdmExportPressed:function ( evt ) {
        
    },

    onVdmFilterExpressionBtnPressed:function ( evt ) {
        var viewData = this.getCurViewData(); 
        // he.uilib.Message.showInfor("Filter Expression", viewData.filter);
        he.uilib.Message.showHTMLContent( "Filter Expression", viewData.filterExpression);
    },

    onVdmTreeGoPairPressed: function ( evt ) {
        var node = this.vdmTree.getSelection();

        this.vdmTree.gotoPairNode(node);
    },

    prepareAttrTbl: function ( ) {
        this.attrTblModel = new sap.ui.model.json.JSONModel();
        this.attrTbl.setModel(this.attrTblModel);
    },    

    prepareCalcTbl: function ( ) {
        //now just reuse same model
        this.calcTbl.setModel(this.attrTblModel);
    },    

    prepareVdmTree: function ( ) {
        this.vdmTreeNodeTemplate = new he.model.TreeNode({
            nodeName: {
                path : 'name',
            },    
            nodeType: {
                path: 'nodeType',
                formatter: function ( val ) {
                    var context = this.getBindingContext();
                    if (he.isLogicNode(val)) {
                        //for the logic mode, need set the nodeType2 also, so later can get the correct icon
                        var type2 = context.getProperty('nodeType2');
                        this.setNodeType2( type2 );
                    }

                    //in order to ensure when call setNodeType the imageInfo have correctly set,here set the imageInfo in the formatter
                    this.setImageInfo( context.getProperty('imageInfo'));
                    return val;
                }
            }, 
            //imageInfo: '{imageInfo}'
        });

        this.vdmTreeModel = new sap.ui.model.json.JSONModel();
        this.vdmTree.setModel(this.vdmTreeModel);
    },

    adjustColumnVisible: function ( evt ) {
        var node = evt.getParameter('node');        
        
        var realType = node.getRealNodeType();
        var aShowCol = this.mVisibleCols[ realType];

        for (var i = 0; i < this.aCheckCol.length; i++) {
            var colIdx = this.aCheckCol[ i ] ; 

            //if in the visible col then show
            var pos = aShowCol.indexOf(colIdx);
            var col = this.aAttrTblCol[ colIdx];

            col.setVisible( (pos != -1) );
        }
        
    },
    
    onDepVdmTblPressed: function ( evt ) {
        var link = evt.getSource();
        if (link.getType() == he.DSType.Tbl) {
            alert("Sorry, jump to table will support soon!");
            return;
        } 
        var uri = link.getUri();
        //now it like
        //sap.hba.ecc/calculationviews/ParkedAccountingDocumentEntryView
        //
        var re = /\/(.*)\/calculationviews\/(.*)$/;
        var ret = re.exec(uri);
        if ( ret) {
            var pkg = ret[1];
            var view = ret[2];
            var node = this.hanaTree.findNode(pkg,view);
            if (node) {
                this.hanaTree.setSelection(node);
            } else {
                alert("Can't find view " + uri + ", please load it first!");
            }
        } else {
            he.assert(false, "The vdm uri not correct: " + uri);
        }
    },

    adjustSematicsProp: function ( node ) {
    /*    if (! he.isSemaNode(node)) {
            //this.vdmPanel.setVisible(false);
            if (this.vboxVdmProp.getContent().length != 1 ) {
                this.vboxVdmProp.removeContent( this.vdmPanel);
                // this.vboxVdmProp.addContent( this.attrTbl);
            }
            return;
        }

        //first add or move vdmPanel
        if (this.vboxVdmProp.getContent().length != 2 ) {
            this.vboxVdmProp.removeAllContent();
            this.vboxVdmProp.addContent( this.vdmPanel);
            this.vboxVdmProp.addContent( this.attrTbl);
        }
*/
        var i, desc, arr, link;
        if (! he.isSemaNode(node)) {
            this.vdmPanel.setVisible(false);
            return;
        }

        this.vdmPanel.setVisible(true);
        
        //??here need check why each time set them one by one??
        //
        //set the prop one by one
        // this.lblVdmDesc.setText( this.curVdmData.desc);
        desc = this.curVdmData.desc || this.curVdmData.name;
        this.vdmPanel.getTitle().setText( desc);

        //for dep vdm            
        if ( this.curVdmData.aDepVdm.length) {
            desc = "Depended Vdms ({0}):".sapFormat(this.curVdmData.aDepVdm.length);
            this.byId("LabelDepVdm").setText(desc);

            //remove the old one by one
            this.hboxDepVdm.removeAllContent();
            this.hboxDepVdm.addContent( this.byId("LabelDepVdm"));

            arr = this.curVdmData.aDepVdm;
            for (i = 0; i < arr.length; i++) {
                var vdm = arr[ i ] ; 
                // var link = new sap.ui.commons.Link({});
                link = new he.uilib.DepLink({
                    text: vdm.name,
                    type: vdm.type,
                    uri: vdm.uri,
                    press: [this.onDepVdmTblPressed, this]
                });
                link.addStyleClass('MarginLeft_1em');
                this.hboxDepVdm.addContent(link);
            }
            this.hboxDepVdm.setVisible(true);
        } else {
            this.hboxDepVdm.setVisible(false);
        }

        //for dep tbl
        if ( this.curVdmData.aDepTbl.length) {
            desc = "Depended Tables ({0}):".sapFormat(this.curVdmData.aDepTbl.length);
            this.byId("LabelDepTbl").setText(desc);

            //remove the old one by one
            this.hboxDepTbl.removeAllContent();
            this.hboxDepTbl.addContent( this.byId("LabelDepTbl"));

            arr = this.curVdmData.aDepTbl;
            for ( i = 0; i < arr.length; i++) {
                var Tbl = arr[ i ] ; 
                // var link = new sap.ui.commons.Link({});
                link = new he.uilib.DepLink({
                    text: Tbl.name,
                    type: Tbl.type,
                    uri: Tbl.uri,
                    press: [this.onDepVdmTblPressed, this]
                });
                link.addStyleClass('MarginLeft_1em');
                this.hboxDepTbl.addContent(link);
            }

            this.hboxDepTbl.setVisible(true);
        } else {
            this.hboxDepTbl.setVisible(false);
        }

        //input param
        if ( this.curVdmData.aInputParam.length) {
            this.hboxInputParam.setVisible(true);

            //first restore
            this.hboxInputParam.removeAllContent();
            this.hboxInputParam.addContent(this.byId("LabelInputParam"));
            this.hboxInputParam.addContent(this.byId("VdmInputParamDetail"));
            

            desc = "Input Parameters ({0}):".sapFormat(this.curVdmData.aInputParam.length);
            this.byId("LabelInputParam").setText(desc);

            for (i = 0; i < this.curVdmData.aInputParam.length; i++) {
                var ip = this.curVdmData.aInputParam[ i ] ; 
                var tv = new sap.ui.commons.TextView({
                    text: ip.name
                });
                if (ip.mandatory) {
                    tv.setDesign("Bold");
                }
                tv.addStyleClass('MarginLeft_1em');

                this.hboxInputParam.addContent(tv);
            }

        } else{
            this.hboxInputParam.setVisible(false);
        }
    },

    //for the join node, show more detail
    adjustNodeTitle: function (node) {
        var extra = node.getNodeName();
        if ( he.isSemaNode(node) || he.isLogicNode(node) )  {
            //extra = node.getNodeName();
        } else if ( node.isLeaf()) {
            extra += "    type: ";
            if (he.isVdmNode(node)) {
                extra += 'Vdm';
            } else {
                extra += 'Table';
            }
        } else  {
            if ( he.isJoinNode(node)) {
                var viewData = node.getViewByNode( this.curVdmData);
                extra += "    type: " + viewData.joinType;
                if (viewData.cardinality) {
                    extra += " [" + viewData.cardinality + "]";
                }
                if (viewData.languageColumn) {
                    extra += "  language: " + viewData.languageColumn;
                }
            } else {
                extra += "    type:" + he.util.getFullNodeTypeName(node); 
            }
        } 

        var title = "Node: " + extra;
        //this.attrTbl.setTitle(title );
        //this.byId("AttrTableTitle").setText(title);
        he.core.byId('AttrTableHeader').setText(title);
    },

    onVdmNodeSelectionChanged: function (evt) {
        var node = evt.getParameter('node');
        
        this.adjustNodeTitle(node);
        
        this.adjustSematicsProp(node);

        //adjust pair btn enabled
        var pairNode = node.getPairNode();
        this.byId("VdmTreeGoPariBtn").setEnabled ( pairNode!== null );

        //try hight light pair
        this.vdmTree.highlightPair(node);

        this.adjustColumnVisible(evt);

        var viewData = node.getViewByNode(this.curVdmData);
        this.attrTblModel.setData( viewData);
        this.attrTbl.bindRows("/aAttr" );

        //show or hide the calc table depend on how many data it has 
        //also binding the calc table
        this.calcTbl.bindRows("/aCalc" );        
        var calcCount = 0;
        if ( viewData.aCalc)
            calcCount = viewData.aCalc.length;

        if ( calcCount === 0) {
            this.calcPanel.setVisible(false);
        } else {
            this.calcPanel.setVisible(true);
            var text = 'Calculated attributes/measures (' + calcCount + ')';
            this.calcPanel.setTitle(  new sap.ui.commons.Title({text:text}) );
            this.calcTbl.setVisibleRowCount(calcCount);
        }

        //only when have the filter, it will enable the fitler button
        var flag = false;
        if (viewData.filter  && viewData.filter!== "")
            flag = true;
        this.byId("VdmFilterExpressionBtn").setEnabled( flag) ;
        //as normally the filter is short, so can directly show on button
        var filterText = 'Filter';
        if (flag) {
            //for the first time format it 
            viewData.filterExpression = he.util.ExpressionHelper.formatSimpleExpression(viewData.filter);

            //!! here the text can't be too long, just show part of them, now 50
            if (viewData.filter.length <50)
                filterText +=":  " + viewData.filter;
            else 
                filterText +=":  " + viewData.filter.substr(0, 50) + " ... ";
        }

        //??later need considerate too long
        this.byId("VdmFilterExpressionBtn").setText(filterText);
    },

    adjustHanaTreeButtonStatus: function ( node ) {
        if (he.isContentNode(node) || he.isCatalogNode(node)) {
            this.byId("HanaTreeDelBtn").setEnabled ( false);
            this.byId("HanaTreeOpenFilesFileChoose").setEnabled ( false);
            this.byId("HanaTreeAddPkgBtn").setEnabled ( true);            
        } else if ( he.isLeafNode(node)) {
            this.byId("HanaTreeOpenFilesFileChoose").setEnabled ( false);
            this.byId("HanaTreeDelBtn").setEnabled ( true);
            this.byId("HanaTreeAddPkgBtn").setEnabled (false);
        } else if (he.isPkgNode(node)) {
            this.byId("HanaTreeOpenFilesFileChoose").setEnabled ( true );
            this.byId("HanaTreeDelBtn").setEnabled ( true);
            this.byId("HanaTreeAddPkgBtn").setEnabled ( true);
        }  else if (he.isCatalogNode(node)) {
            this.byId("HanaTreeOpenFilesFileChoose").setEnabled (false);
            this.byId("HanaTreeDelBtn").setEnabled ( false);
            this.byId("HanaTreeAddPkgBtn").setEnabled (false);
        }
    },

    onHanaNodeSelectionChanged: function (evt) {
        var node = evt.getParameter('node');

        this.adjustHanaTreeButtonStatus(node);

        //adjust the status
        //?? this.byId("HanaTreeDelBtn");

        if (!node.isLeaf())
            return;

        //just show the vdm tree
        var data = node.getData();
        this.curVdmData = data;
        this.vdmTreeModel.setData( data );
        this.vdmTree.bindNodes('/mTree', this.vdmTreeNodeTemplate);

        //update tille also , so user easy know which vdm it point to
        this.vdmTree.setTitle("VDM " + node.getNodeName());

        //also focus the Semantics node
        he.TreeHelper.focusRootNode(this.vdmTree);
    },

    getCurViewData: function () {
        var node = this.vdmTree.getSelection();
        return node.getViewByNode(this.curVdmData);
    },

    setAttrTblCols: function ( cols ) {
        this.aAttrTblCol = cols;
    },

    vdmTree: null,
    pkgTree: null,

    vdmTreeNodeTemplate : null,
    vdmTreeModel: null,

    aAttrTblCol: [],
    attrTbl: null,
    attrTblModel: null,

    aCheckCol: [ he.ColIdx.SrcName0, he.ColIdx.SrcName1 ,
                he.ColIdx.Desc, he.ColIdx.Filter],

        /*Aggr: 'Aggr',
        Join: 'Join',
        Prj :  'Prj',  //projection
        Union: 'Union',

        //following two means the leaf node
        Vdm: 'Vdm',   //
        Table:  'Table', //

        Sema : 'Semantics',   //the semantic node
        Logic: 'logicModel',    //the logic model, just under the 'Semantics'
*/
    //here the name must be same as the NodeType     
    mVisibleCols: {

        'Aggr': [   he.ColIdx.SrcName0,  he.ColIdx.Filter ],
        'Prj' : [   he.ColIdx.SrcName0,  he.ColIdx.Filter ],
        'Union': [  he.ColIdx.SrcName0,  he.ColIdx.SrcName1 ,
                he.ColIdx.Filter], //??
        'Join': [ he.ColIdx.SrcName0,  
                  he.ColIdx.SrcName1 ,
                he.ColIdx.Filter ],
        'Semantics': [he.ColIdx.Desc],
        'Vdm' :  [  he.ColIdx.SrcName0],
        'Table': [  he.ColIdx.SrcName0]
    },    

    //??
    curVdmData: null, 
    nodeOfAddVdm: null, //the node for add vdms
});