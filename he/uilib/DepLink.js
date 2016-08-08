jQuery.sap.require('sap.ui.commons.Link');

//support the link for vdm or tbl
sap.ui.commons.Link.extend("he.uilib.DepLink", {
	metadata : {
		properties : {
			type: { type: "string"},   //vdm or tbl
			uri: {type: 'string'},
		}
	},
	renderer : 'sap.ui.commons.LinkRenderer'
});