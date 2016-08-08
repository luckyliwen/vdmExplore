sap.ui.commons.TreeNode.extend("he.model.TreeNode", {
	metadata : {
		properties : {
			/*information help to create the correct icon, like '', -c,  -f, -c-f:  c means calculated column, f means filter*/
			imageInfo: {type: "string", defaultValue: ""},

			nodeName: { type: "string"},  
			nodeType: {type: "string", defaultValue: ""},

			//?? as only nodeType can't get the real type for logic mode, so need use another type
			nodeType2: {type: "string", defaultValue: ""},
			data: {type: "object", defaultValue: null},

			//the extra text, used to tell the mapping relationship
			//extraText: {type: "string", defaultValue: ""},
			
			targetName: {type: "string", defaultValue: ""},

			mapType: {type: "string", defaultValue: ""},

			isTrack: {type: "boolean", defaultValue: false},
		
		},

		events : {}
	},

	init: function (  ) {
		this.aExtraText = [];
	},

	/**
	 * for the logic mode, then return the real calc type
	 * @return {[type]} [description]
	 */
	getRealNodeType:function (  ) {
		var nodeType = this.getNodeType();
		if (he.isLogicNode(nodeType)) {
			return this.getNodeType2();
		} else {
			return nodeType;
		}

	},

	setNodeName: function ( name ) {
		this.setProperty('nodeName', name);

		this.setText(name);
	},

	resetText: function (  ) {
		this.setText( this.getNodeName());
	},

	resetIcon: function (  ) {
		this.setNormalIcon();
	},

	/*considerate the Calculation column and filter*/
	setNormalIcon: function () {
		//depend on the type, set the icon
		var type = this.getNodeType();
		if (he.isLogicNode(type)) {
			var type2 = this.getNodeType2();
			icon = './images/' + type2.toLowerCase() + this.getImageInfo() + '.png';
		} else {
			icon = './images/' + type.toLowerCase() + this.getImageInfo() + '.png';
		}
		
		this.setIcon(icon);
		return icon;
	},


	clearTrack : function ( evt ) {
		this.setNormalIcon();
		this.resetText();

		this.aExtraText = [];
		this.setIsTrack(false);
	},

	trackNode: function ( ) {
		this.setTrackText();
		this.setTrackIcon();	
		this.setIsTrack(true);
	},

	addExtraText: function ( str ) {
		this.aExtraText.push(str);
	},

	setTrackText: function ( evt ) {
		//??how to set more complex text ??
		//this.setText( this.getNodeName() + "-->" + this.getExtraText() );
		//so need set it by mapType
		var mapType = this.getMapType();
		var extraStr = "";
		if (mapType == he.MapType.Normal) {
			//so only need show one name
			extraStr = "............({0})".sapFormat(this.getTargetName());
		} else if (mapType == he.MapType.Rename) {
			//can from one or two map
			extraStr = this.aExtraText.join(',');
			extraStr = "............[{0}]".sapFormat(extraStr);
			extraStr += " ---->> " + this.getTargetName();
		} else {
			he.assert( false, "Now the const map will not show");
		}

		var text = this.getNodeName() + extraStr;
		this.setText( text );
	},

	/*
	use the icon name like --path
	 */
	setTrackIcon: function () {
		//depend on the type, set the icon
		var type = this.getNodeType();
		if (he.isLogicNode(type)) {
			var type2 = this.getNodeType2();
			icon = './images/' + type2.toLowerCase() + '-path.png';
		} else {
			icon = './images/' + type.toLowerCase() + '-path.png';
		}
		
		this.setIcon(icon);
		return icon;
	},

	getPairNode: function (  ) {
		var parent = this.getParent( );
		var nodes = parent.getNodes();
		if (nodes.length ==2) {
			for (var i = 0; i < nodes.length; i++) {
				var n = nodes[ i ] ; 
				if (n != this){
					return n;
				}
			}
		}
		return null;
	},

	//so the nodeType2 must set first ??
	setNodeType: function ( type ) {
		this.setProperty('nodeType', type);
		var icon;

		this.setNormalIcon();
	},

	isLeaf: function () {
		return he.isLeafNode(this.getNodeType());
	},

	getViewByNode: function ( vdmData ) {
		var nodeType = this.getNodeType();
		if (he.isSemaNode(nodeType) || he.isLogicNode(nodeType)) {
			return vdmData[ nodeType];
		} else {
			var name = this.getNodeName();
			return vdmData.mView[ name ];
		}
	},

});