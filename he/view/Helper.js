he.view.Helper = {};

he.view.Helper.simulateControlClicked = function( id) {
		$("#" + id).click();
};


//used to cache dialog
he.view.Helper.Cache = {
	InputDlg: {
		
	}
};


/**
 * Set the table columns width by factors
 * aWidth: like 1, 2, 3
 */
he.view.Helper.setTableColumnsWidth = function( table, aWidth) {
	
	var total = 0;
	for(var i=0 ;i <aWidth.length;i++){
		total += aWidth[i];
	}
	
	var aCol = table.getColumns();
	he.assert(  aCol.length == aWidth.length,  "Table columns not same as width array" );
	
	aCol.forEach( function(col, idx) {
		col.setWidth( aWidth[idx] * 100 / total +"%");
	});
	
};


/**
 * Create a list for single/multiple selection
 * selectedItems:  the array which should set as selected 
 */
he.view.Helper.createSimpleList = function ( aText, mode, selectedItems) {
	
	var aSels = [];
	if ( selectedItems) {
		aSels = selectedItems;
		if ( ! ( selectedItems instanceof Array )) {
			aSels = [selectedItems];
		}
	}
	
	var list = new sap.m.List( { mode: mode});
	for ( var i = 0; i < aText.length; i++) {
		var text = aText[i];
		var item =  new sap.m.StandardListItem( { title:  aText[i]});
		list.addItem(item);
		
		if ( aSels.indexOf( text) != -1) {
			list.setSelectedItem(item, true);
		}
	}
	
	return list;
};

/**
 * Add the defualt ok/cancel button to the dialog, and set default action
 * if choose ok then set state to Success
 */
he.view.Helper.addDefaultButtonForDialog = function(dlg) {
	return dlg;
};

//==as so many tree related funcs, so just he the he.TreeHelper.xx
he.TreeHelper = {
	/**
	 * Get the subnode by name 
	 * @param  {[type]} parentNode [description]
	 * @param  {[type]} name       [description]
	 * @return {[type]}        null if not found, 
	 */
	getSubNodeByName: function ( parentNode, name ) {
		var aNode = parentNode.getNodes();
		for (var i = 0; i < aNode.length; i++) {
			var node = aNode[ i ] ; 
			if (name === node.getText())
				return node;
		}
		return null;
	},

	focusRootNode: function ( tree ) {
		var nodes = tree.getNodes();
		if (nodes.length) {
			tree.setSelection( nodes[0]);	
		}
	},

	//j.find('li[role="treeitem"][title="Join_6_1"]')
	findJQueryItemByTitle: function (treeId, title) {
		var $tree = $('#' + treeId);
		var attr = 'li[role="treeitem"][title="{0}"]'.sapFormat(title);
		return $tree.find(attr);
	},
};

