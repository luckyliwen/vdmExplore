he={};
he.view = {};
he.util = {};
he.model= {};
he.cfg = {};
he.uilib = {};
he.cfg = {};

he.assert = jQuery.sap.assert;
he.error = console.error;
he.log = console.log;

//now put both the hana view and vdm view together, so it have so many node type, 
he.NodeType = {
		//for the package tree
		Pkg:  'Pkg',
		Content: 'Content', //the hana content, put all package here
		Catalog: 'Catalog', //the hana category node, put all table here

		//4 calculation node
		Aggr: 'Aggr',
		Join: 'Join',
		Prj :  'Prj',  //projection
		Union: 'Union',

		//following two means the leaf node
		Vdm: 'Vdm',   //
		Table:  'Table', //

		Sema : 'Semantics',   //the semantic node
		Logic: 'logicModel',    //the logic model, just under the 'Semantics'

		// just for error check
		Unknow: 'Unknow'
};

he.MapType =  {
	Rename: 'rename',
	Normal: '',
	Const:  'Constant'
};

//==here the join type choose from hana xml file, so the value must be same as 
he.JoinType = {
	Inner: 'inner',
	LeftOut: 'leftOuter',
	RightOuter : 'rightOuter',
	Text : 'TextTable',
};

//following column index used to adjust the tree columns
he.ColIdx = {
//	Type:     0,
	SrcName0: 0,
	SrcName1: 1,
	Name:     2,
	Desc:     3,
	Filter:   4,
	Formula:  5,
	Map:   6,  //how map from src to tgt
};

he.getNodeTypeSmart = function(nodeType) {
	var type = nodeType;
	if (nodeType instanceof he.model.TreeNode) {
		type = nodeType.getNodeType();
	}
	return type;
};

//used too often, so put here
he.isLeafNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);
	if ( type == he.NodeType.Vdm || type == he.NodeType.Table)
		return true;
	return false;
};

he.isNotLeafNode = function ( nodeType ) {
	return ! he.isLeafNode(nodeType);
};

he.isSemaNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);

	return type == he.NodeType.Sema;
};

he.isLogicNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);
	return type == he.NodeType.Logic;
};

he.isPkgNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);
	return type == he.NodeType.Pkg;
};

he.isVdmNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);
	return type == he.NodeType.Vdm;
};

he.isJoinNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);
	return type == he.NodeType.Join;
};


he.isContentNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);

	return type == he.NodeType.Content;
};

he.isCatalogNode = function ( nodeType ) {
	var type = he.getNodeTypeSmart(nodeType);
	return type == he.NodeType.Catalog;
};

he.isRootNood = function ( evt ) {
	var type = he.getNodeTypeSmart(nodeType);

	return (type == he.NodeType.Content)  || (type == he.NodeType.Catalog);	
};

//DS : Data Source
he.DSType = {
	Vdm: 'Vdm',
	Tbl:  'Tbl' //table 
};

he.Str = {
	// CalcView : "CALCULATION_VIEW",
	// DataTable: "DATA_BASE_TABLE",
	//Sema : "Semantics",
};

he.crlf = "\r\n";
he.crlf2 = "\r\n\r\n";


jQuery.sap.declare('he.Application');
jQuery.sap.require('sap.ui.app.Application');  

sap.ui.app.Application.extend('he.Application',
{
	init: function() {
		
		var bus = sap.ui.getCore().getEventBus();
		//as so many part need use it
		he.bus = bus;
		he.core = sap.ui.getCore();

		//now just build it, later can get it from previous build
		he.model.VdmMng.init();
	},
	
	main: function() {
		// create app view and put to html root element
		var rootName = this.getRoot();
		sap.ui.jsview("app", "he.view.Main").placeAt(rootName);

		//ginit();
	}
});
			
//??
var gc = sap.ui.getCore();		

/**
 * As in order for performance, so the saved file only have the necessary prop, in order for easy 
 * so here add the default property: othewise,need like:  is ( ('i0' in entry) && entry.i0
 * @param {[type]} attr [description]
 */
he.addDefaultAttrProp = function (attr) {
	var aName = ['i0','n0','i1','n1','fo'];
	for (var i = 0; i < aName.length; i++) {
		var name = aName[ i ] ; 
		if ( !(name in attr)) {
			attr[name] = "";
		}
	}
	//here return it also, so can used like he.addDefaultAttrProp( .aAttr[i]);
	return attr;
};
