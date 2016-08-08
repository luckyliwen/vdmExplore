// Here set some common used shortcut
he.bus = sap.ui.getCore().getEventBus();
he.core = sap.ui.getCore();

he.byId = function(id) {
	return sap.ui.getCore().byId(id);
};

String.prototype.sapFormat = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] != 'undefined' ? args[number] : match;
			});
};

String.prototype.sapStartWith = function(str) {
	if (!this)
		console.error("call sapStartwith error");

	if (str.length > this.length)
		return false;

	var left = this.substr(0, str.length);

	return str == left;
};

String.prototype.sapEndWith = function(str) {
	var pos = this.length - str.length;
	if (pos < 0)
		return false;

	var right = this.substr(pos);

	return str == right;
};

/**
 * Get the last part of one string, for sap.m.Button, then it will get Button
 */
String.prototype.sapLastPart = function(sep) {
	if (sep === undefined)
		sep = ".";

	var pos = this.lastIndexOf(sep);
	if (pos === -1)
		return this;
	else {
		return this.substr(pos + 1);
	}
};

/**
 * Repeart one string multiple times
 * 
 * @param cnt
 * @returns
 */
String.prototype.sapRepeat = function(cnt) {
	var ret = this;
	for (var i = 1; i < cnt; i++) {
		ret += this;
	}
	return ret;
};


/**
 * Remove one string last part by length or string
 * s = "name.xml.view'
 * s.sapRemoveLast(5)  = name.xml
 * s.sapRemoveLast('view')  = name.xml. 
 * @param lenOrStr
 */
String.prototype.sapRemoveLast = function( lenOrStr) {
	if (typeof lenOrStr == 'number') {
		return this.substr(0,   this.length - lenOrStr);
	} else {
		//if not end by it then no remove
		he.assert( this.sapEndWith(lenOrStr));
		return this.substr(0,   this.length - lenOrStr.length);
	}
};


/**
 * Get the pure name, means if it enclosed in ' or " in both side, then just get the name, if not there then directly return 
 */
String.prototype.sapPureName = function() {
	if (this[0] =="'" || this[0] =='"') {
		//??just ensure it is a pair
		he.assert( this.slice(-1) =="'" || this.slice(-1) =='"' , "Not paired correctly");
		return this.substr(1, this.length-2);
	} else {
		return this;
	}
};

/**
 * Get the pure name, means if it enclosed in ' or " in both side, then just get the name, if not there then directly return 
 */
String.prototype.sapCapital = function() {
	return this[0].toUpperCase() + this.slice(1);
};

/**
 * Remove the corresponding element from the array (which sub-element is a map)
 * by match the key with value For example arr = [ { name: 'title'} { name:
 * 'text'} ]
 * 
 * then call arr.sapRemove('name', 'title') arr will be: arr = [ { name: 'text'} ] *
 * 
 * @param key
 * @param value
 */
Array.prototype.sapRemove = function(key, value) {
	for (var i = 0; i < this.length; i++) {
		var ele = this[i];
		if (key in ele) {
			if (ele[key] == value) {
				this.splice(i, 1);

				// here still return the original array so can used in chain
				return this;
			}
		}
	}

	return this;
};

/**
 * Push a new entry key=value into the array
 * 
 * @param key
 * @param value
 * @returns {Array}
 */
Array.prototype.sapPush = function(key, value) {
	var m = {};
	m[key] = value;
	this.push(m);
	return this;
};

/**
 * Return an array which equal big array substract the small array
 * 
 * @param arr
 */
Array.prototype.sapDiff = function(subArr) {
	var ret = [];
	this.forEach(function(e) {
				if (subArr.indexOf(e) == -1)
					ret.push(e);
			});
	return ret;
};

/**
 * Check whether two array all content is same
 * @param arr
 */
Array.prototype.sapEqual = function( arr) {
	if ( this.length != arr.length)
		return false;
	
	for ( var i = 0; i < this.length; i++) {
		var ele = this[i];
		if (arr.indexOf(ele) == -1)
			return false;
	}
	return true;
};

/*
 * Get the array from it's children value by key For example: arr = [ {name:
 * "sap.m.Page"}, {name: "sap.m.Button"}, ] then arr.sapSubArray() =
 * ["sap.m.Page", "sap.m.Button"]
 */
Array.prototype.sapSubArray = function(key) {
	var ret = [];
	this.forEach(function(obj) {
				ret.push(obj[key]);
			});
	return ret;
};


/*
 * For an object array, get the index of the entry with the defined key->value
 * key: 'name',
 * value: 'id'  
 * normal case: the prop of xml can't repeat, then when add the prop it will check whether name already existed or not  
 */
Array.prototype.sapIndexOf = function(key, value) {
	for (var i=0; i< this.length; i++ ) {
		var e = this[i];
		if (  key in e) {
			if (e[key] == value)
				return i;
		}
	}
	
	return -1;
};


/**
 * Complex means have it's owen property
 */
he.util.isComplexObject = function(obj) {
	return !he.util.isEmptyObject(obj); 
};

he.util.isEmptyObject = function(obj) {
	if (typeof obj == 'string')
		return true;
	
	for (var k in obj ) {
		return false;
	}
	return true;
};

he.util.buildD3Tree_internal = function( tree, map, name) {
	
};

/**
 * map like
 * name like 'sap.ui.core.Element'
 */
he.util.buildD3Tree = function(map, name, parentTree) {
	var tree = parentTree;
	if (tree === undefined)
		tree = {};
		
	
	tree.name = name;
	
	if ( typeof map == 'object') {
		tree.children = [];
	}
	
	var entry;
	for (var key in map) {
		var obj = map[key];

		switch (typeof obj) {
			case "string" :
				entry = { name: key};
				tree.children.push( entry);
				break;

			case "object" :
				var node = {};
				tree.children.push(node);
				he.util.buildD3Tree(obj, key, node);
				break;
			default :
				break;
		}
	}

	return tree;
};
 

/**
 * Convert a map to an array recursevely
 */
he.util.map2ArrayDeep = function(map) {
	var arr = [];
	for (var key in map) {
		var obj = map[key];

		switch (typeof obj) {
			case "string" :
				arr.push(key);
				break;

			case "object" :
				//first add the key, then recursively
				arr.push(key);
				
				//??only Object, no need support Array
				if (obj instanceof Object) {
					//then deeply
					if (he.util.isComplexObject(obj)) {
						var subArr = he.util.map2ArrayDeep(obj);
						arr.push(subArr);
					}
				}
				break;
			default :
				break;
		}
	}

	return arr;
};


/**
 * Convert a map to an array
 */
he.util.map2Array = function(map) {
	var arr = [];
	for (var key in map) {
		var obj = map[key];

		switch (typeof obj) {
			case "string" :
				arr.push(obj);
				break;

			case "object" :
				// most if is array, then push all
				if (obj instanceof Array) {
					obj.forEach(function(e) {
								arr.push(e);
							});
				} 

				break;
			default :
				break;
		}

	}

	return arr;
};


/*
 * Get longest string length from array
 */
he.util.getLongestLength = function(arr) {
	var max = 0;
	arr.forEach(function(str) {
				if (str.length > max)
					max = str.length;
			});
	return max;
};

/**
 * Fill the string with filled char until it reach the required length
 */
he.util.fillString = function(str, len, fill) {
	if (fill === undefined)
		fill = " ";
	he.assert(fill.length == 1, "Now not support long char as filled");

	var missCnt = len - str.length;
	if (missCnt > 0) {
		var fillStr = fill.sapRepeat(missCnt);

		return str + fillStr;
	} else {
		return str;
	}
};



/**
 * Get how many key for an map
 */
he.util.getKeyCount = function(map) {
	var ret = 0;
	for (var key in map) {
		ret++;
	}
	return ret;

};


/**
 * For example conent = "<xml>\r\n</xml>", name = 'xml', then it will like xml = '<xml>' +
 * '\r\n' + '</xml>'
 * 
 * @param content
 * @param name
 */
he.util.convertStringToJSRunableString = function(name, content) {
	var str = "var " + name + " = ";

	var arr = content.trim().split('\r\n');

	for (var i = 0; i < arr.length; i++) {
		var line = arr[i];

		// if line have the ' then need escape
		if (line.indexOf("'") != -1) {
			line = line.replace(/\'/g, "\\\'");
		}

		str += "\t\t\t'" + line + "'";
		if (i != (arr.length - 1))
			str += "\t+\t'\\r\\n'" + " + \r\n";
		else
			str += ";";
	}

	return str;

};


/**
 *??  
 */
he.util.convertFileNameToUrl = function(fn) {
	
	//if (! fn.sapStartWith('file:///')) {
	//http://10.58.67.2:8080/htmlview/Calendar.view.html
	//alway stand url
	var pos = fn.indexOf("://");
	if (pos == -1) {	
		//  \ to / first
		return 'file:///' + fn.replace(/\\/g, '/');
	} else {
		return fn;
	}
};




/**
 * Stringify a json object to ui5 binding style string,  
  s = {a: 'a',  b: 'b'}
	JSON.stringify(s) =  "{"a":"a","b":"b"}"

 */
he.util.jsonStringify = function(obj) {
	//easy way first do JSON.stringify, then use regexp to change
	var str = JSON.stringify(obj);
	
	
	var normal = str.replace(/\"(\w+)\":/mg, function(match, number) {
		//now match contain the word, space and : 
		var word = match.trim();
		//remove the last :
		
		return   word.substr(1, word.length-3) + ':';
	});
	
	//then " change to '
	normal = normal.replace(/\"/g, "'");
	return normal;
};


//just from the top most check one by one, if not there then add it
he.util.addJsonValueSafely = function(map, path, value) {
	var mNameIdx;
	var arr = path.split('/');
	var obj = map;
	for ( var i = 0; i < arr.length; i++) {
		var name = arr[i];
		
		if (name ==="")
			continue;
		
		//the last, directly add, otherwise just loop
		if (i === arr.length-1) {
			//??last name like name[0] also
			
			mNameIdx = he.util.splitComplexName(name);
			
			if ( mNameIdx.index == -1) {
				obj [name] = value;
			} else {
				//like name[1], so maybe existed already, like first name[0], then name[1]
				if (  name in obj) {
					//if there just overwirte, other just push
					if (obj[name].length > mNameIdx.index) {
						obj[name][ mNameIdx.index] = value;
					}  else {
						obj[name].push(value);
					}
				} else {
					//??
					obj[name].push( value);	
				}
			}
		} else {
			//need check whether the name like table[0], if so then need split into two part
			mNameIdx = he.util.splitComplexName(name);
			
			if ( mNameIdx.index == -1) {
				//just name
				if (name in obj) {
					obj = obj[name];
				} else {
					obj[name] = {};
					obj = obj[name];
				}
			} else {
				//like name[0]
				if (mNameIdx.name in obj) {
					obj = obj[mNameIdx.name];
					
					//the index may not there, 
					if ( obj.length> mNameIdx.index) {
						obj  = obj [ mNameIdx.index ];	
					} else {
						//??sub still array, too comple now
						while(true) {
							obj.push( {});
							if ( obj.length> mNameIdx.index) {
								obj  = obj [ mNameIdx.index ];
								break;
							}
						}
					}
				} else {
					obj[mNameIdx.name] = [];
					obj[mNameIdx.name].push( {});
					
					obj = obj[mNameIdx.name];
					obj  = obj [ mNameIdx.index ];
				}
			}
		}
	}
	
};


he.util.jsonPrettyStringify = function(json, indent) {
	var str = JSON.stringify(json, undefined, 4);
	arr = str.split("\n");
	var sep = "\r\n" + indent;
	return indent + arr.join(sep);
};


/**
 * 
 */
he.util.getTreeNodeSubNode = function( treeNode, subNodeName) {
	var nodes = treeNode.getNodes();
	for ( var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.getText() == subNodeName)
			return node;
	}
	
	return null;
};


/**
 * 
 */
he.util.getTreeNodeChildNames = function( node) {
	he.assert( node, "[he.util.getTreeNodeChildNames] node is null");
	var i, subNode,arr = [];
	var nodes = node.getNodes();
	
	//first get all direct child,  
	for (  i = 0; i < nodes.length; i++) {
		subNode = nodes[i];
		arr.push(subNode.getText()); 
	}
	
	//then iterate the child
	for ( i = 0; i < nodes.length; i++) {
		subNode = nodes[i];
		var subArr = he.util.getTreeNodeChildNames(subNode);
		
		subArr.forEach( function(name) {
			arr.push(name);
		});
	}
	
	return arr;
};

//IF(&quot;DebitCreditCode&quot; = 'S', &quot;CashDiscountBaseAmount&quot;, -1*&quot;CashDiscountBaseAmount&quot;"
he.util.unescapeFormula = function( str ) {
	return str.replace(/&quot;/g, '"');
};

he.util.unescapeFilter = function( str ) {
	return str.replace(/&quot;/g, '"');
};

he.util.getFullNodeTypeName = function( nodeType ) {
	var ret;
	var type = nodeType;
	if (nodeType instanceof he.model.TreeNode) {
		type = nodeType.getNodeType();
	}
	
	switch (type) {
		case he.NodeType.Aggr : 
			ret = 'Aggregation';
			break;
		case he.NodeType.Join : 
			ret = 'Join';
			break;
		case he.NodeType.Prj: 
			ret = 'Projection';
			break;
		case he.NodeType.Union : 
			ret = 'Union';
			break;
		default:
			break;
	}
	return ret;
};

he.util.getVdmNameFromFileName = function ( fn ) {
	//now support both aa.calculationview;  and xml
	if (fn.sapEndWith('.calculationview'))
		return fn.sapRemoveLast('.calculationview');
	else if (fn.sapEndWith('.xml'))
		return fn.sapRemoveLast('.xml');
	else 
		return fn;
};


he.util.expandTreeTable = function ( table ) {
	var oRows = table.getRows();
	for (var i = 0; i < oRows.length; i++) {
        table.expand(i);
	}
};

