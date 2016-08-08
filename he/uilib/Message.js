/**
 * Provide some common functions to show error/warning
 */
he.uilib.Message = {
	//??later need reuse the dialog
	buildDialog: function(title, content) {
		var dlg = new sap.ui.commons.Dialog({
			title: title,
			content: content,
			width: "800px"
		});
		return dlg;
	},
	
	showInfor: function( title, aInfo) {
		if ( !(aInfo instanceof Array))
			aInfo = [ aInfo];
		this.showErrors(title,aInfo);
	},

	showErrors: function( title, aError) {
		var vbox = new sap.ui.layout.VerticalLayout();
		
		for (var i = 0; i < aError.length; i++) {
			var err = aError[i];
			
			//now just use an TextArea, and smartly calculate the row/cols
			var textArea = new sap.ui.commons.TextArea({
				rows : 4,
				width : "750px",
				//value: err
			});
			textArea.setValue(err);
			textArea.addStyleClass('.MarginTop');
			
			vbox.addContent(textArea);
		}
		
		var dlg = this.buildDialog(title, vbox);
		dlg.open();
	}, 

	showHTMLContent: function( title, html) {
		var content = new sap.ui.core.HTML({content: html});
		var dlg = this.buildDialog(title, content);
		dlg.open();
	},

	showToast: function ( msg ) {
		sap.m.MessageToast.show(msg);
	},	
};

