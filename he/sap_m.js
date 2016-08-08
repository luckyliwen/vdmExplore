sap ={};
sap.m={};
sap.ui.commons.Button = function() {};
sap.ui.commons.attachPress = function(){};
sap.m.commonsButton.attachTab = function(){};
sap.m.List = function() {};
sap.m.Text = function() {};
sap.m.Label = function() {};
sap.m.Table = function() {};

//==commons

//==layout
sap.ui.layout.VerticalLayout = function() {};
//semanticColor
//{Default: "Default", Positive: "Positive", Negative: "Negative", Critical: "Critical"}


//sap.ui.commons.x.TextView
//sap.ui.core.Control-->
sap.ui.commons.TextView = {
	metadata : {
		publicMethods : [
			// methods
			"expandAll", "collapseAll"
		],

		// ---- control specific ----
		properties : {
			"title" 					: {titleype : "string", 			defaultValue : null},
			"width" 					: {type : "sap.ui.core.CSSSize",	defaultValue : 'auto'},
			"height" 					: {type : "sap.ui.core.CSSSize", 	defaultValue : 'auto'},
			"showHeader" 				: {type : "boolean", 			 	defaultValue : true},
			"showHeaderIcons" 			: {type : "boolean",  			 	defaultValue : true},
			"showHorizontalScrollbar" 	: {type : "boolean", 			 	defaultValue : false},   //{Emph: "Emph", Accept: "Accept", Reject: "Reject", Default: "Default"}
			"minWidth" 					: {type : "sap.ui.core.CSSSize", 	defaultValue : null}
		},
		defaultAggregation : "nodes",
		aggregations : {
	    	"nodes" : {type : "sap.ui.commons.TreeNode", multiple : true, singularName : "node", bindable : "bindable"}
		},
		events : {
			"select" : {allowPreventDefault : true}
		}
	},
	/**
		var textView = new sap.ui.commmons.TextView {
			title: "",
			nodes: {
			}
			}
		}
	*/
};

sap.ui.commons.Tree = function() {
var metadata = {
	publicMethods : [
		"expandAll", "collapseAll"
	],

	properties : {
		"title" 					: {type : "string", 		group : "Misc", defaultValue : null},
		"width" 					: {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : 'auto'},
		"height" 					: {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : 'auto'},
		"showHeader"				: {type : "boolean", 		group : "Misc", defaultValue : true},  //
		"showHeaderIcons" 			: {type : "boolean", 		group : "Misc", defaultValue : true},
		"showHorizontalScrollbar" 	: {type : "boolean", 		group : "Misc", defaultValue : false},
		"minWidth" 					: {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null}
	},

	defaultAggregation : "nodes",
	aggregations : {
		"nodes" : {type : "sap.ui.commons.TreeNode", multiple : true, singularName : "node", bindable : "bindable"}
	},

	events : {
		"select" : {},
	}
}
};


sap.ui.commons.Tree = function() {
	var publicMethods =[
			// methods
			"expandAll", "collapseAll"
		];

	var	properties : {
			"title" : {type : "string", group : "Misc", defaultValue : null},
			"width" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : 'auto'},
			"height" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : 'auto'},
			"showHeader" : {type : "boolean", group : "Misc", defaultValue : true},
			"showHeaderIcons" : {type : "boolean", group : "Misc", defaultValue : true},
			"showHorizontalScrollbar" : {type : "boolean", group : "Misc", defaultValue : false},
			"minWidth" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null}
		},
		defaultAggregation : "nodes",
		aggregations : {
	    	"nodes" : {type : "sap.ui.commons.TreeNode", multiple : true, singularName : "node", bindable : "bindable"}
		},
		events : {
			"select" : {allowPreventDefault : true}
		}
	}
};

