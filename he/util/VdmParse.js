he.util.VdmParse = {
	//??not good, chg later
    initAttr: function ( entry ) {
        //as there are so many place need create the attr entry, so init here
        entry.name = "";
        //entry.type = "";
        //entry.desc = "";
        //entry.isCalc =  false;
        //entry.isJoin = false;
        //entry.filter = null;
        entry.map = "";
        //entry.n0 = "";
        //entry.i0 = "";
        //entry.n1 = "";
        //entry.i1 = "";
        //entry.fo = "";
        return entry;
    },

    initCalcAttr: function ( entry ) {
        //as there are so many place need create the attr entry, so init here
        entry.id = "";  //id
        entry.desc = "";  //id
        entry.datatype = ""; //datatype 
        entry.formula = "";
        entry.datatypeExtra = ""; //like length, scale
        return entry;
    },
    
    //some tool
    getVdmType: function ( outputViewType ) {
        var ret;
        switch (outputViewType) {
            case "Aggregation" :
                ret = he.NodeType.Aggr;
                break;
            case "Projection" : //??
                ret = he.NodeType.Prj;
                break;
            default:
                break;
        }
        return ret;
    },

    getNodeType: function ( type ) {
        var ret;
        switch (type) {
            case "Calculation:ProjectionView" :
                ret = he.NodeType.Prj; 
                break;
            case "Calculation:AggregationView" :
                ret = he.NodeType.Aggr; 
                break;
            case "Calculation:JoinView" :
                ret = he.NodeType.Join; 
                break;
            case "Calculation:UnionView" :
                ret = he.NodeType.Union; 
                break;
            default:
                break;
        }
        return ret;
    },

    /**
     * Get the real view from the node
     * @param  {[type]} node [description]
     * @param  {[type]} m    [description]
     * @return {[type]}      [description]
     */
    getViewByNode: function ( node, m) {
        var ret = null;
        switch (node.nodeType) {
            case he.NodeType.Sema: 
                ret = m[ he.NodeType.Sema ];
                break;
            case he.NodeType.Logic: 
                ret = m[ he.NodeType.Logic ];
                break;
            default:
                //for others just get it by the name, if not there then return null
                if ( node.name in m.mView) {
                    ret= m.mView[ node.name];
                }
                break;
        }
        return ret;
    },



    /**
    abbres:
    dep: depend 
    var: variable
    tbl: table

    */
    parseVdm: function ( xmlDoc ) {
        //outputViewType="Aggregation" 
        var m = {
            vdmType: "",
            desc   : "",

            //each like {name:'P_KeyDate', desc: '', mandatory: true}
            aInputParam: [],
            aVar  : [],
            // mVarMapping : {},
            aDepTbl  : [],
            aDepVdm: [],

            //the tree for vdms,first is sema
            mTree: {},

            //all the view under the mView in order to avoid one name is same as the predefined prop
            mView: {}
        };

        var root = $(xmlDoc);
        //var root  = node.find('scenario')

        this.parseRootAttr(root,m);

        this.parseInputParamAndVariable(root,m);

        this.parseParamMapping(root,m);

        this.parseDataSources(root,m);
        
        this.parseCalcView(root,m);

        this.parseLogicModel(root,m);

        this.buildSemanticsNode(root,m);

        this.buildAllTreeNode(root,m);

        this.adjustAttrOrderForJoin(m);        

        return m;
    },

    /**
     * <Calculation:scenario xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" xmlns:Variable="http://www.sap.com/ndb/BiModelVariable.ecore" schemaVersion="2.2" id="AccountingDocumentEntryView" checkAnalyticPrivileges="false" defaultClient="crossClient" defaultLanguage="$$language$$" hidden="false" visibility="reportingEnabled" calculationScenarioType="TREE_BASED" enforceSqlExecution="true" 
     * executionSemantic="UNDEFINED" outputViewType="Aggregation" runWithInvokerPrivileges="false">

    //now only support graphic view    calculationScenarioType="TREE_BASED" dataCategory="CUBE" enforceSqlExecution="true" executionSemantic="UNDEFINED" outputViewType="Aggregation">
    //sql view: calculationScenarioType="SCRIPT_BASED"  
     * parse the root attribute
     * @type {[type]}
     */
    parseRootAttr: function(node, m) {
        var scenarioType = node.attr('calculationScenarioType');
        if (scenarioType == 'SCRIPT_BASED') {
            throw new Error("Sorry, now don't support script based VDM");
        }

        //??for simple, here just do some check, if not mandatory attribute then throw exception
        var type = node.attr('outputViewType');
        if ( !type ) {
            throw new SyntaxError("Invalid hana Calculation view format. Can't find the outputViewType for root node");
        }

        m.vdmType = this.getVdmType(type);

        var desc = node.find('>descriptions');
        m.desc = desc.attr('defaultDescription') || "";
    },

/*
    if have the 'parameter'  then means is InputParam, other is variable
    <variable id="P_KeyDate" parameter="true">
      <descriptions defaultDescription="Key Date"/>
      <variableProperties datatype="NVARCHAR" defaultValue="20140110" length="8" mandatory="true">
        <valueDomain type="empty"/>
        <selection multiLine="false" type="SingleValue"/>
      </variableProperties>
 */
    parseInputParamAndVariable:function ( node, m ) {
        var vars = node.find(">localVariables>variable");
        for (var i = 0; i < vars.length; i++) {
            var v = $(vars[ i ]) ;

            var entry = {name:'', isParam: false, type: "", desc:'', mandatory:false, defaultValue: '', 
                    length: 0, mapping: ''};
            entry.name = v.attr('id');
            if (v.attr('parameter')) {
                entry.isParam = true;
            }
            entry.desc = v.find('descriptions').attr('defaultDescription') || "";
            var prop = v.find('variableProperties');
            entry.mandatory = eval(prop.attr('mandatory')) || false;
            entry.type = prop.attr('datatype');
            entry.defaultValue = prop.attr('defaultValue');
            if (prop.attr('length'))
                entry.length = prop.attr('length');

            m.aInputParam.push(entry);            
        }
    },

/*<variableMappings>
    <mapping xsi:type="Variable:VariableMapping" dataSource="#DaysSalesOutstanding">
      <targetVariable name="P_NumberOfMonthsForRevenue" resourceUri="/sap.hba.r.sfin700/calculationviews/DaysSalesOutstanding"/>
      <localVariable>#P_RevnRollingAverageMonths</localVariable>
    </mapping>
  
*/    
    parseParamMapping:function ( node, m ) {
        var mappings = node.find(">variableMappings>mapping");

        for (var i = 0; i < mappings.length; i++) {
            var mapping = $(mappings[ i ]) ;

            //            remove the first #
            var localVar = mapping.find('localVariable').text().substr(1);
            var idx = m.aInputParam.sapIndexOf( 'name', localVar);
            
            jQuery.sap.assert(idx !== -1, 'parseParamMapping local var ' + localVar + " can't find in aInputParam");
            if (idx !== -1) {
                //may be one param map to two, so need check 
                var targetVar = mapping.find('targetVariable');
                var mapDesc = targetVar.attr('resourceUri').sapLastPart('/');
                mapDesc += ' --> ' + targetVar.attr('name');
                if ( m.aInputParam[idx].mapping) {
                    m.aInputParam[idx].mapping += '\r\n' + mapDesc;
                } else {
                    m.aInputParam[idx].mapping = mapDesc;
                }
            } 
        }
    },

/*
//??"DATA_BASE_VIEW"  ProjectRevenueObjects
 
<DataSource id="CASHDISCOUNT" type="CALCULATION_VIEW">
      <viewAttributes allViewAttributes="true"/>
      <resourceUri>/tmp.fo2.joy/calculationviews/CASHDISCOUNT</resourceUri>
    </DataSource>
    <DataSource id="BNK_BATCH_HEADER" type="DATA_BASE_TABLE">
      <viewAttributes allViewAttributes="true"/>
      <columnObject schemaName="SAP_ECC" columnObjectName="BNK_BATCH_HEADER"/>
 */
    parseDataSources:function ( node, m ) {
        var aDs = node.find(">dataSources>DataSource");

        for (var i = 0; i < aDs.length; i++) {
            var ds = $(aDs[ i ] ); 
            var entry = {name:'', type: '', uri:""};

            entry.name = ds.attr('id');
            var type = ds.attr('type');

            if (type == "CALCULATION_VIEW") {
                entry.type = he.DSType.Vdm;
                //like <resourceUri>/tmp.fo2.joy/calculationviews/CASHDISCOUNT
                entry.uri = ds.find('>resourceUri').text();

                m.aDepVdm.push(entry);
            } else if (type == "DATA_BASE_TABLE" ) {
                entry.type = he.DSType.Tbl;

                //like <columnObject schemaName="SAP_ECC"
                entry.uri = ds.find('>columnObject').attr('schemaName');

                m.aDepTbl.push(entry);                
            } else {
                //??need check DATA_BASE_VIEW 
                //??Parse file WBSElementSalesOrderItemsQuery.calculationview error:TypeError: Cannot read property 'aInput' of null
                he.assert(false, 'unknow ds type ' + type);
                continue;
            }
        }
    },    

    getAttrIndexByTarget: function ( mView, target ) {
        for (var i = 0; i < mView.aAttr.length; i++) {
            if (target == mView.aAttr[i].name)
                return i;
        }
        return -1;
    },

    /*
    formula like if(isnull("GroupThreshold_Hiden"),101,"GroupThreshold_Hiden"),
    then the related attr is GroupThreshold_Hiden
    find out all the "\w+" , and if that attr is inside the attr then need add 
    */
    _calculateRelatedAttr: function(mView, formula) {
        var ret = [];
        var re = /\"(\w+)\"/;
        while (true) {
            var match = re.exec(formula);    
            if (match) {
                var name = match[1];
                var idx = mView.aAttr.sapIndexOf('name', name); 
                if (idx !== -1) {
                    //also need check only add once 
                    if ( ret.indexOf(name) == -1)
                        ret.push(name);
                }

                //continue search  next
                var pos = formula.indexOf( match[0]);
                formula = formula.substr( pos + match[0].length);
            } else {
                break;
            }
        }
        
        return ret;
    }, 

    parseCalcViewAttr:function ( view, mView ) {
        //first basic attr
        //<viewAttribute id="SAPClient"/>
        
        //filter like
        // <viewAttribute id="PRODUCT_ID">
          //         <filter xsi:type="AccessControl:SingleValueFilter" including="true" value="ProdId"/>
          //       </viewAttribute>

        //<viewAttribute aggregationType="sum" id="QUANTITY_1"/>
        var i, attr, entry;
        var aAttr = view.find(">viewAttributes>viewAttribute");
        for (i = 0; i < aAttr.length; i++) {
            attr = $(aAttr[ i ] ); 
            //??type 
            entry = this.initAttr({});
            entry.name = attr.attr('id');
            entry.aggr = attr.attr('aggregationType') || "";

            //??need check the aggr
            var filter = attr.find('>filter');
            if (filter.length >0) {
                //??
                entry.filter = {};  //add later
            }

            mView.aAttr.push(entry);
        }

        //then the cal attr 
        //calculatedViewAttributes
        // <calculatedViewAttribute datatype="DECIMAL" id="CashDiscountBaseAmount_t" length="15" scale="2">
        //   <formula>IF(&quot;DebitCreditCode&quot; = 'S', &quot;CashDiscountBaseAmount&quot;, -1*&quot;CashDiscountBaseAmount&quot;)</formula>
        // </calculatedViewAttribute>

        //??as the calculated attr noramlly is long, so put in another array
        aAttr = view.find(">calculatedViewAttributes>calculatedViewAttribute");
        for (i = 0; i < aAttr.length; i++) {
            attr = $(aAttr[ i ] ); 

            //??type 
            entry = this.initCalcAttr({});
            entry.id = attr.attr('id');
            entry.datatype = attr.attr('datatype');
            //?? if have length and scale, then like 15 :  2
            var length = attr.attr('length');
            if (length) {
                entry.datatypeExtra = length;    
                if (attr.attr('scale')) {
                    entry.datatypeExtra += ' : ' + attr.attr('scale');
                }
            }

            var formula = attr.find('>formula').text();
            formula = he.util.unescapeFormula(formula);
            entry.formula = formula;

            //here found the calculated, so can know which attr it will related with, then later can easily track the path
            //here only need know the related pure attr, as the related calc attr is too complex 
            
            entry.aRelatedAttr = this._calculateRelatedAttr(mView, formula);

            //??aggr type entry.aggr = attr.attr('aggregationType') || "";
            mView.aCalc.push(entry);

        }
    },
    
    /**
     * check whether the node name is in the dep vdm or the tbl, 
     * @param  {[type]}  evt [description]
     * @return {Boolean}     [description]
     */
    isLeafNode: function ( node , m) {
        var pos = m.aDepTbl.sapIndexOf('name', node);
        if (pos != -1) {
            return true;
        }

        pos = m.aDepVdm.sapIndexOf('name', node);
        return pos != -1;
    },

    getLeafNodeType: function ( node, m ) {
        var pos = m.aDepTbl.sapIndexOf('name', node);
        if (pos != -1) {
            return he.NodeType.Table;
        } else {
            return he.NodeType.Vdm;
        }
    },

    /*
      <input node="#Projection_1">
normal mapping
       <mapping xsi:type="Calculation:AttributeMapping" target="SAPClient" source="MANDT"/>
constant mapping
       "<mapping xsi:type="Calculation:ConstantAttributeMapping" 
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" target="ReverseDocument" null="true" value=""/>"
     */
    parseCalcViewMapping: function ( view, mView, m) {
        var aInput = view.find(">input");
        for (var i = 0; i < aInput.length; i++) {
            var input = $(aInput[ i ] ); 

            //<input node="#REGUP">
            var node  = input.attr('node');
            node = node.slice(1);  //remove the  #

            var isLeaf = this.isLeafNode(node, m);
            var leafView ;
            if (isLeaf) {
                leafView = {
                    aAttr: [], 
                    aCalc : [], //the calculated attr
                    aInput: [], 
                    name:     node, 
                    nodeType: this.getLeafNodeType(node, m)
                };
            }


            mView.aInput.push(node);

            //for the join have two source, for others only one, so need create the source0 or source1 first
            
            var srcName = 'n' + i;
            var srcNode = 'i' + i;

            // <mapping xsi:type="Calculation:AttributeMapping" target="SAPClient" source="MANDT"/>
            var aMapping = input.find(">mapping");
            for ( iMap = 0; iMap < aMapping.length; iMap++) {
                var mapping = $(aMapping[ iMap ]) ; 
                var tgt = mapping.attr('target');
                var src ="";

                //!! here need handle by different mapping type
                var mapTypeStr = mapping.attr("xsi:type");
                var mapType = he.MapType.Normal;

                if  (mapTypeStr == 'Calculation:AttributeMapping') {
                     src = mapping.attr('source');
                     if ( src != tgt) {
                        mapType = he.MapType.Rename;                         
                     }
                } else if ( mapTypeStr == 'Calculation:ConstantAttributeMapping'){
                    //here just the constant name, so no need care
                    mapType = he.MapType.Const;
                } else {
                    he.assert(false, 'map type unknown ' + mapTypeStr);
                }

                var iAttr = this.getAttrIndexByTarget(mView, tgt);
                if ( iAttr != -1) {
                    if ( mapType == he.MapType.Normal || he.MapType.Rename) {
                        mView.aAttr[iAttr][ srcName] = src;
                        mView.aAttr[iAttr][ srcNode] = node;
                    } else {
                        //here as from the mapType it can know is constant, so can set name to ""
                        mView.aAttr[iAttr][ srcName] = "";
                        mView.aAttr[iAttr][ srcNode] = node;
                    }    

                    mView.aAttr[iAttr].map = mapType;

                } else {
                    //?? is normal
                    he.assert(false, 'From target ' + tgt + "can't find the index");
                }

                //for the leaf input, just add itself to the attr table
                if (isLeaf) {
                    var entry = this.initAttr({});
                    entry.name = tgt;
                    entry.i0 = node;
                    entry.n0 = src;
                    entry.map = mapType;

                    leafView.aAttr.push(entry);
                }
            }

            //here direct add the mView
            if ( isLeaf) {
                m.mView[ node ] = leafView;
            }            
        }
    },

    /**
     * Parse the calc view general property, such as the join type, xxx
     */
    //xsi:type="Calculation:JoinView" id="Join_5" cardinality="C1_N" joinType="leftOuter">
    //cardinality="C1_1" joinType="textTable" languageColumn="SPRAS">
    parseCalcViewGeneralProp: function ( node, mView ) {
        function simplifyCardinality(cardinality) {
            //map C1_1     to 1:1
            var ret = cardinality.replace('C', '');
            return ret.replace('_', ':');
        }

        var type = node.attr('xsi:type');
        var nodeType = this.getNodeType(type);
        mView.nodeType  = nodeType;

        switch (nodeType) {
            case he.NodeType.Aggr : 
                break;
            case he.NodeType.Join : 
                mView.joinType = node.attr('joinType');
                if (mView.joinType === "textTable") {
                    mView.languageColumn = node.attr('languageColumn');
                }
                var cardinality = node.attr('cardinality');
                if (cardinality) {
                    mView.cardinality = simplifyCardinality(cardinality);    
                }
                break;
            case he.NodeType.Union : 
                break;
            case he.NodeType.Prj : 
                break;
            default:
                break;
        }

    },

    /**
     * Parse the extra property, now for joinAttribute
     * <joinAttribute name="BATCH_NO"/>
     * @param  {[type]} node  [description]
     * @param  {[type]} mView [description]
     * @return {[type]}       [description]
     */
    parseCalcViewExtraProp: function ( node, mView ) {
          // <joinAttribute name="BATCH_NO"/>
        var aJoinAttr = node.find(">joinAttribute");
        for (var i = 0; i < aJoinAttr.length; i++) {
            he.assert( mView.nodeType == he.NodeType.Join, "Only join node have the joinAttribute");
            var attr = $(aJoinAttr[ i ] ); 
            var id = attr.attr('name');

            var iAttr = this.getAttrIndexByTarget(mView,id);
            he.assert( iAttr != -1, "iAttr is -1 for " + id);

            if (iAttr != -1) {
                mView.aAttr[ iAttr].isJoin = true;
            }
        }

    },

    //??check the view level filter expression
    // <filter>&quot;KTOSL&quot;='MWS'</filter>
    parseCalcViewFilter: function ( node, mView ) {
        var filter = "";
        var jq = node.find('>filter');
        if ( jq.length) {
            filter = jq.text();
            fitler  = he.util.unescapeFilter(filter);
        }
        mView.filter = filter;
    },

    parseCalcView: function ( node, m  ) {
        var aView = node.find(">calculationViews>calculationView");

        for (var i = 0; i < aView.length; i++) {
            var view = $(aView[ i ] );
            var id = view.attr('id'); 

            var mView = { aAttr: [], aCalc:[], aInput:[] , name: id};

            //general prop
            this.parseCalcViewGeneralProp(view, mView);

            //add the output
            this.parseCalcViewAttr(view, mView);

            //then add the mapping
            this.parseCalcViewMapping(view, mView, m);

            //extra prop, such as joinAttr
            this.parseCalcViewExtraProp(view, mView);

            //filters
            this.parseCalcViewFilter(view, mView);

            //add to it
            m.mView[ id ] = mView;
        }
    },

/*
    <attributes>
       <attribute id="SAPClient">
        <descriptions defaultDescription="SAPClient"/>
        <keyMapping columnObjectName="Join_1" columnName="SAPClient"/>
      </attribute>
*/
    parseLogicModelAttr: function ( node, mView ) {
        var aAttr = node.find(">attributes>attribute");
        for (var i = 0; i < aAttr.length; i++) {
            var attr = $(aAttr[ i ] ); 
            var entry = this.initAttr({});
            
            entry.name = attr.attr('id');
            entry.desc = attr.find('>descriptions').attr('defaultDescription');
            
            var mapping = attr.find('>keyMapping');
            entry.n0 = mapping.attr("columnName");
            entry.i0 = mapping.attr("columnObjectName");

            mView.aAttr.push(entry);
        }
    },

/*        <baseMeasures>
      <measure id="AmountInTransactionCurrency" hidden="true" aggregationType="sum" measureType="simple">
        <descriptions defaultDescription="AmountInTransactionCurrency"/>
        <measureMapping columnObjectName="Join_1" columnName="AmountInTransactionCurrency"/>
      </measure>
*/
    parseLogicModelBaseMeasure: function ( node, mView ) {
        var aMeasure = node.find(">baseMeasures>measure");
        for (var i = 0; i < aMeasure.length; i++) {
            var measure = $(aMeasure[ i ] ); 
            var entry = this.initAttr({}); 
            
            entry.name = measure.attr('id');
            entry.desc = measure.find('>descriptions').text();

            //??entry.type = ??
            entry.aggr = measure.attr('aggregationType') || "";
            entry.measureType = measure.attr('measureType') || "";

            var mapping = measure.find('>measureMapping');
            entry.n0 = mapping.attr("columnName");
            entry.i0 = mapping.attr("columnObjectName");

            mView.aAttr.push(entry);
        }
    },

/*    <calculatedMeasures>
      <measure id="Utilization" hidden="true" aggregationType="sum" measureType="simple" datatype="DECIMAL" length="15" scale="4">
        <descriptions defaultDescription="Utilization"/>
        <formula>IF(&quot;MaxOfferedCashDiscountInTransacCrcy&quot; = 0.0, 1.0, &quot;CashDiscountAmtInTransacCrcy&quot; / &quot;MaxOfferedCashDiscountInTransacCrcy&quot;)</formula>
      </measure>
    </calculatedMeasures>
*/
    parseLogicModelCalcMeasure: function ( node, mView ) {
        var aMeasure = node.find(">calculatedMeasures>measure");
        for (var i = 0; i < aMeasure.length; i++) {
            var measure = $(aMeasure[ i ] );

            var entry = this.initCalcAttr({});
            entry.id = measure.attr('id');
            entry.desc = measure.find('>descriptions').text();

            entry.datatype = measure.attr('datatype');
            //?? if have length and scale, then like 15 :  2
            entry.datatypeExtra = measure.attr('length');


            var formula = measure.find('>formula').text();
            formula = he.util.unescapeFormula(formula);
            entry.formula = formula;
            mView.aCalc.push(entry);
        }
    },

    parseLogicModel: function ( node, m  ) {
        //from the vdmType know the name
        var nodeTypeName = he.util.getFullNodeTypeName(m.vdmType);

        var logicModel = $(node.find(">logicalModel"));

        var mView = { aInput:[], 
            aAttr:[], 
            aCalc:[], 
            nodeType: he.NodeType.Logic,  
            nodeType2: m.vdmType,
            name: nodeTypeName,

        };
        // <logicalModel id="Join_2">
        //get the aInput 
        var id = logicModel.attr('id');
        mView.aInput.push(id);

        this.parseLogicModelAttr(logicModel, mView);
        this.parseLogicModelBaseMeasure(logicModel, mView);
        this.parseLogicModelCalcMeasure(logicModel, mView);

        //??so the other node can't name like Aggregation??
        //m.mView[ nodeTypeName] = mView;
        
        

        //here put it to outside is in order to avoid name conflict, as itself can have a node named Aggregation also
        m.logicModel = mView;

        //and the Semantic(root) node can get from the logic model
    },

    buildSemanticsNode: function ( node, m) {
        var logicNodeName = m.logicModel.name; 
        var entry = {nodeType: he.NodeType.Sema, name: he.NodeType.Sema,  aInput: [logicNodeName], aAttr:[]};

        //here can't directly close the logic mode, as in the logic part it have the name mapping, but for the semantic node just one->one mapping
        for (var i = 0; i < m.logicModel.aAttr.length; i++) {
            var refAttr =  m.logicModel.aAttr[i];  
            var attrEntry = this.initAttr({});
            attrEntry.name = refAttr.name;
            attrEntry.desc = refAttr.desc;
            //the srcName and srcNode is special
            attrEntry.n0 = refAttr.name;
            attrEntry.i0 = logicNodeName;

            entry.aAttr.push(attrEntry);
        }
        
        m[ he.NodeType.Sema ] = entry;
    }, 

    /**
     * Add a new node to the parent
     * @param {[type]} parent [description]
     * @param {[type]} name   [description]
     * @param {[type]} type  
     * @return   -- the new created entry
     */
    addTreeNode: function (parent, name,type, imageInfo ) {
        imageInfo = "" || imageInfo;
        var entry = {'name': name, 'nodeType': type, 'nodeType2': "", imageInfo: imageInfo};

        //the parent may or may not have the children, so need check here
        if ( ! ('children' in parent)) {
            parent.children = [];
        }
        parent.children.push(entry);
        return entry;
    },

    buildOneTreeNode : function ( node, m ) {
        //add the input as the children
        var view = this.getViewByNode(node, m);
        var aInput = view.aInput;
        if ( ! aInput ) {
            alert('meet error');
            return;
        }

        for (var i = 0; i < aInput.length; i++) {
            var input = aInput[ i ] ; 
            
            //from the name get the read 
            var nodeType = this.getNodeTypeByInput(input,m);

            var imageInfor = this.getImageInfoByViewName(input, m);
            var entry = this.addTreeNode(node, input, nodeType, imageInfor);

            if ( he.isNotLeafNode(nodeType)) {
                //then do it resursive
                this.buildOneTreeNode(entry, m);
            }
        }
    },

    getImageInfoByViewName: function ( viewName, m) {
        var viewData = {};
        if ( viewName in m.mView) {
            viewData = m.mView[ viewName];
        }
        return this.getImageInfoFromViewData(viewData);
    },

    /**
     * Get the image infor from the view data: depend on whether has the filter, calculation column
     * @param  {[type]} viewData [description]
     * @return {[type]}          [description]
     */
    getImageInfoFromViewData: function ( viewData ) {
        var ret = "";
        if (viewData.aCalc && viewData.aCalc.length>0)
            ret += '-c';
        if (viewData.filter)
            ret += '-f';
        return ret;
    },

    /**
     * create the d3 like tree so it can easily show as the Tree
     * @param  {[type]} node [description]
     * @param  {[type]} m    [description]
     * @return {[type]}      [description]
     */
    buildAllTreeNode: function ( node, m ) {
        //first build the Semantics
        //then add the logicModel,
        //later one by one add all
        var mTree = { children: [] };

        var semaNode = this.addTreeNode(mTree, he.NodeType.Sema, he.NodeType.Sema);

        //then add the logic mode
        var nodeTypeName = he.util.getFullNodeTypeName(m.vdmType);
        var imageInfor = this.getImageInfoFromViewData(m.logicModel);
        var logicNode = this.addTreeNode(semaNode, nodeTypeName, he.NodeType.Logic, imageInfor);
        //for the logic node, need the type2 ( as later it need show correct icon)
        logicNode.nodeType2 = m.vdmType;

        //then start build the logic one by one
        this.buildOneTreeNode(logicNode, m);


        m.mTree = mTree;
    },

    /**
     * In order to easy know the join columns for the join, we put all the join column at the top
     * @param  {[type]} m [description]
     * @return {[type]}   [description]
     */
    adjustAttrOrderForJoin : function ( m ) {
        var i, aAttr, arrTmp=[], viewData;
        for (var name in m.mView) {
            viewData = m.mView[ name ];
            if (viewData.nodeType === "Join") {
                //from the last to first check whether n0 and n1 both existed, if so then first move it to an tmp array, 
                //then later insert back
                arrTmp = [];
                aAttr = viewData.aAttr;
                for (i = aAttr.length-1; i>=0; i--) {
                    if (aAttr[i].n0 && aAttr[i].n1) {
                        arrTmp.push( aAttr.splice(i,1)[0]);
                    }
                }
                
                //then add back 
                while (arrTmp.length) {
                    aAttr.unshift( arrTmp.shift());
                }
            }
        }
    },
    
    /**
     * From the input node get the 
     * @param  {[type]} input [description]
     * @param  {[type]} m     [description]
     * @return {[type]}       [description]
     */
    getNodeTypeByInput : function ( input, m ) {
        //first check whether is a normal calc view
        if ( input in m.mView) {
            var view = m.mView[ input];
            return view.nodeType;
        }

        //is vdm or table
        var idx = m.aDepTbl.sapIndexOf('name', input);
        if ( idx != -1) {
            return he.NodeType.Table;
        } else {
            idx  = m.aDepVdm.sapIndexOf('name',input);
            if (idx != -1) {
                return he.NodeType.Vdm;
            } else {
                he.assert(false, "can't get node type , input", input, m);
                return he.NodeType.Unknow;
            }
        }
    },
};