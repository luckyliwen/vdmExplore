he.model.Vdm = {
	
	/**
	 * 
	 * @param pkg
	 * @param viewName
	 */
	parseLocalVdm: function( pkg, vdm) {
		var uri = he.cfg.getVdmUri(vdm);
		var xmlDoc = he.util.io.loadFileContent(uri);

		var data = he.util.VdmParse.parseVdm( xmlDoc);
		return data;
	},



	parseVdmContent: function(str) {
		// try {
			var xmlDoc = $.parseXML(str);		
			var data = he.util.VdmParse.parseVdm( xmlDoc.documentElement);
			return data;
	},

	
    /**
     * Check whether is leaf node by the node name
     * @param  {[type]}  vdmData  [description]
     * @param  {[type]}  nodeName [description]
     * @return {Boolean}          [description]
     */
/*    isLeafNode: function ( vdmData, nodeName) {
        ;
    },
*/
    /*getViewData: function ( vdmData, nodeType, nodeName ) {
        if (he.isSemaNode(nodeType) || he.isLogicNode(nodeType)) {
            return vdmData[ nodeType];
        } else {
            return vdmData.mView[ name ];
        }
    },
*/
};