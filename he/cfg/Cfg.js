he.cfg = {
	
	//C:\src\hana_ws\e91\sap\hba\ecc
	//AccountingDocumentJournalQuery.calculationview
	getVdmUri: 	function ( vdm ) {
		return "file:///C:/src/hana_ws/e91/sap/hba/ecc/" + vdm + ".calculationview";
	}
};