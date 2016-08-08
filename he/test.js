/*

 if("ZBD3T"!=0, 
 	adddays("_BLDATE",int("ZBD3T")), 
 	if("ZBD2T"!= 0,
 		adddays("_BLDATE",int("ZBD2T")), 
 		if("ZBD1T"!=0, adddays("_BLDATE",int("ZBD1T")), 
 "_BLDATE")))