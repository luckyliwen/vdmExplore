sap.ui.commons.Tree.extend("he.uilib.HanaTree", {
	metadata : {
		properties : {
		},

		events : {}
	},

	renderer : 'sap.ui.commons.TreeRenderer',

	doInit: function ( ) {
		this._contentNode = new he.model.TreeNode({
			nodeName: 'Content',
			nodeType: he.NodeType.Content
		});

		this._catalogNode = new he.model.TreeNode({
			nodeName: 'Catalog -- support tables later!!',
			nodeType: he.NodeType.Content
		});
		
		this.addNode(this._contentNode);
		this.addNode(this._catalogNode);
		
		//some basic tree will add first 
		this.addPkg('sap.hba.ecc');
		this.addPkg('sap.hba.r.sfin700');
		this.addPkg('sap.hba.sfin700');
	},

	getContentNode: function ( evt ) {
		return this._contentNode;
	},

	getCategoryNode: function ( evt ) {
		return this._catalogNode;
	},

	addPkg: function ( pkg ) {
		return this.addOrGetPkgNode(pkg);
	},

	addVdm: function ( pkg, vdm, data ) {
		var node = this.addOrGetPkgNode(pkg);
		return this.addVdmUnderPkgNode(node, vdm, data);
	},

	addOrGetPkgNode: function ( pkg ) {
		var aName = pkg.split('.');
		var parent = this._contentNode;

		for (var i = 0; i < aName.length; i++) {
			var name = aName[ i ] ; 
			var node = he.TreeHelper.getSubNodeByName(parent, name);
			if ( !node) {
				node = this.addOnePkg(parent, name);
			}

			//move down
			parent = node;
		}

		return parent;
	},

	addOnePkg: function ( parent, pkg ) {
		var node = new he.model.TreeNode({
			nodeName: pkg,
			nodeType: he.NodeType.Pkg
		});
		parent.addNode(node);
		return node;
	},

	addComplexPkg: function ( parent, pkg ) {
		//may like the sap/hba/ecc, so first change 
		if ( pkg.indexOf('/') !== -1) {
			pkg = pkg.replace(/\//g, '.');
		}
		var aName = pkg.split('.');

		for (var i = 0; i < aName.length; i++) {
			var name = aName[ i ] ; 
			var newNode = this.addOnePkg(parent, name);

			//move down
			parent = newNode;
		}
		return parent;
	},

	/**
	 * Called when user choose one node and add view under it
	 * @param {[type]} pkg [description]
	 * @param {[type]} data Optional
	 * @param {[type]}     [description]
	 */
	addVdmUnderPkgNode: function ( pkgNode, vdmName, data) {
		var node = new he.model.TreeNode({
			nodeName: vdmName,
			nodeType: he.NodeType.Vdm
		});
		if (data) {
			node.setData(data);
		}
		pkgNode.addNode(node);
		return node;
	},
	
	/**
	 * Get the full name start from content, so like sap.hba.ecc
	 * @param  {[type]} node Start node
	 * @return {[type]}      [description]
	 */
	getFullPkgName: function ( node ) {
		var aName = [];
		var parent = node;
		while(true) {
			aName.push(parent.getText());
			parent = parent.getParent();
			if (parent == this._contentNode)
				break; 
		}
		aName.reverse();
		return aName.join('.');
	},

	/**
	 * find node by pkg and vdm name
	 * @param  {[type]} pkg     [description]
	 * @param  {[type]} vdmName [description]
	 * @return {[type]}         null if can't found
	 */
	findNode: function ( pkg, vdmName ) {
		//just put it together
		var arr = pkg.split('.');
		arr.push(vdmName);

		var parent = this._contentNode;
		for (var i = 0; i < arr.length; i++) {
			var name  = arr[i];
			var node = he.TreeHelper.getSubNodeByName(parent, name);
			if (!node) {
				return null;
			} else {
				//move down
				parent = node;
			}
		}
		return parent;
		
	},


	_contentNode: null,
	_catalogNode: null,
});