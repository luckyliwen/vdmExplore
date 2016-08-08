// the tag for single char, so from it can easily find the matching char
he.Tag = {
    SingleQuot: "'",
    DoubleQuot: '"',
    LeftP: '(', //Left parenthesis
    RightP: ')',
    Keyword: 'k', //if, adddays
    Operator: 'o', //like + - * / 
    Number: 'n',
    Space: ' ',
    Unknown: 'u',
    InputParam: 'i',  //some time the $$p_keyDate enclose by '', but sometime not

    //========just for if expression
    // Comma:  ','
};


he.Block = {
    Column: 'Column', //like "NetDueDate"
    Keyword: 'Keyword', // if 
    Number: 'Number', //123 , means digital
    String: 'String', //  'hello',
    Operator: 'Operator', //+,-,*, /
    InputParam: 'InputParam',
    Logic:   'Logic',
    Normal:  '' //for those no need special style
};

he.Express = {
    If: 'If', 
    Case: 'Case',
    Mixed: 'Mixed',   //means inside the function have if / case 
    Simple: 'Simple',
};


he.util.ExpressionHelper = {
/*    .ExpColumn {
        color: gray;
    }
*/  
    _getBlockStyle: function ( blockType, block) {
        //??tips: now for normal no need add style 
        var ret = [];

        //so here can make it more precision:  from the keyword can know whether is logic and/or
        if (blockType !== "") {
            if (blockType === he.Block.Keyword) {
                var keyword = block.toLowerCase();
                if (keyword==='and' || keyword==='or') {
                    blockType = he.Block.Logic;
                }
            }
            var start = '<span class="Exp{0}">'.sapFormat( blockType);
            ret.push( start);
            ret.push("</span>");
        }
        return ret;
    }, 

    _mapTag2BlockType: function(tag) {
        var ret = he.Block.Normal;
        switch (tag) {
            case he.Tag.SingleQuot:
                ret = he.Block.String ;
                break;
            case he.Tag.DoubleQuot:
                ret = he.Block.Column;
                break;
            case he.Tag.Operator:
                ret = he.Block.Operator;
                break;
            case he.Tag.Keyword:
                ret = he.Block.Keyword;
                break;
            case he.Tag.InputParam:
                ret = he.Block.InputParam;
                break;
            case he.Tag.Number:
                ret = he.Block.Number;
                break;
            default:
                break;
        }
        return ret;
    },

    _getTag: function(chr, nextChr) {
        var ret = he.Tag.Unknown;
        switch (chr) {
            case '"':
                ret = he.Tag.DoubleQuot;
                break;
            case "'":
                ret = he.Tag.SingleQuot;
                break;
            case '(':
                ret = he.Tag.LeftP;
                break;
            case ')':
                ret = he.Tag.RightP;
                break;
            case '+': //falldown
            case '-': //falldown
            case '*': //falldown
            case '-': //falldown
                ret = he.Tag.Operator;
                break;
            case '$':
                if (nextChr === '$')
                    ret = he.Tag.InputParam;
                break;
            default:
                break;
        }

        //for other, just check one by one 
        if (ret !== he.Tag.Unknown) {
            return ret;
        }

        if (chr >= '0' && chr <= '9') {
            ret = he.Tag.Number;
        } else if ((chr >= 'a' && chr <= 'z') || (chr >= 'A' && chr <= 'Z')) {
            ret = he.Tag.Keyword;
        } else if (chr === ' ' || chr === '\t') {
            ret = he.Tag.Space;
        }

        return ret;
    },

    _getBlock: function(exp, startPos) {
        var pos, tag = this._getTag(exp[startPos], exp[startPos+1]);

        var ret = {
            block: "",
            blockType: this._mapTag2BlockType(tag),

            nextPos: -1,
        };

        if (tag === he.Tag.SingleQuot || tag === he.Tag.DoubleQuot) {
            pos = exp.indexOf(tag, startPos + 1);
            if (pos === -1) {
                //invalid expression, so just reach the end
                jQuery.sap.assert(false, 'meet ' + tag + ' but without mathing. Content ' + exp + ' pos:' + startPos);                
                ret.block = exp.substr(startPos);
                //also change the block type 
                ret.blockType = he.Block.Normal;
                ret.nextPos = exp.length;
            } else {
                ret.block = exp.substring(startPos, pos + 1);
                ret.nextPos = pos + 1;
            }

            //also now the input parameter like '$$P_KeyDate$$', so need considerate it here 
            if (tag === he.Tag.SingleQuot && exp.substr(startPos + 1, 2) === '$$') {
                ret.blockType = he.Block.Column;
            }
        } else if (tag === he.Tag.Keyword) {
            //reach until the end of word 
            var re = /(\w+)/;
            var match = re.exec(exp.substr(startPos));
            jQuery.sap.assert(match, 'logic error, as it should matching the keyword');

            ret.block = match[0];
            ret.nextPos = startPos + match[0].length;
        } else if (tag === he.Tag.InputParam) {
            //then try to reach next $$ , as sometime it just $$ not '$$ 
            pos = exp.indexOf('$$', startPos+2); 
            if (pos === -1) {
                //invalid expression, so just reach the end
                jQuery.sap.assert(false, 'meet $$ but without mathing $$ for ' + exp + ' pos:' + startPos);                
                ret.block = exp.substr(startPos);
                //also change the block type 
                ret.blockType = he.Block.Normal;
                ret.nextPos = exp.length;
            } else {
                ret.block = exp.substring(startPos, pos + 2);
                ret.nextPos = pos + 2;
            }            
        } else {
            ret.block = exp[startPos];
            ret.nextPos = startPos + 1;
        }

        return ret;
    },

   /* _formatBock: function ( blockType, block ) {
        
    },*/

    /**
     * by matching the start ( and end ), find out the while if string content. 
     * !!later considerate combile the getIfExpressionString and parseIfExpression as some logic same 
     * 
     * @param  {[type]} content [description]
     * @return {[type]}         the ending position. just the ) position in the content
     */
    getIfExpressionString :function ( content, startPos ){
        //first find out the first (,  and remove last )
        var exp;
        var pos = content.indexOf('(', startPos);
        jQuery.sap.assert( pos!== -1, "Can't find first (" );

        var parenthesisCnt = 1;
        var i= pos+1;
        var endPos= -1;
        
        while (i < content.length) {
            var chr = content[i]; 
            if (chr === '(') {
                parenthesisCnt ++;
                i++;
            } else if (chr===')') {
                parenthesisCnt --;
                
                if (parenthesisCnt === 0) {
                    //reach the ending ),
                    break;
                } else {
                    //just move to next 
                    i++;
                }
            } else if ( chr === '"' || chr=== "'") {
                //try to match the next matching one 
                pos = content.indexOf( chr, i+1);
                if (pos == -1) {
                    jQuery.sap.assert(false, "Can't find matching " + chr + 'at pos ' + i + ' for ' + content);
                    i = content.length;
                } else {
                    //just move cursor
                    i = pos + 1;
                }
            } else {
                //just continue find  
                i++;
            }
        }

        //??need check whether found last one is the mathing )
        return i; 
    },

    /**
     * By the two , split it into three part
     * @param  {[type]} content [description]
     * @return array:0,1,2: the string content of three part
     */
    parseIfExpression :function ( content ){
        //first find out the first (,  and remove last )
        var exp;
        var pos = content.indexOf('(');
        jQuery.sap.assert( pos!== -1, "Can't find first (" );
        if (pos === -1) {
            return ['Parse Error for: ' + content, "Can't find first (", ""]; 
        }
        exp = content.substr(pos+1);
        
        pos = exp.lastIndexOf(')');
        jQuery.sap.assert(pos!== -1, "Can't find last ) ");
        if (pos === -1) {
            return ['Parse Error for: ' + content, "Can't find last matching )", ""]; 
        }
        exp = exp.substring(0, pos).trim();

        var parenthesisCnt = 0;
        var i=0, firstPos =-1, secondPos = -1;

        while (i < exp.length) {
            var chr = exp[i]; 
            if (chr === '(') {
                parenthesisCnt ++;
                i++;
            } else if(chr===')') {
                parenthesisCnt --;
                i++;
            } else if ( chr === '"' || chr=== "'") {
                //try to match the next matching one 
                pos = exp.indexOf( chr, i+1);
                if (pos == -1) {
                    jQuery.sap.assert(false, "Can't find matching " + chr + 'at pos ' + i + ' for ' + exp);
                    i = exp.length;
                } else {
                    //just move cursor
                    i = pos + 1;
                }
            } else if ( (chr === ',')  && (parenthesisCnt ===0) ) {
                //only when it is not within (), then is wanted , 
                if (firstPos === -1) {
                    firstPos = i;
                } else {
                    //find the second , so can break 
                    secondPos = i; 
                    break;
                }
                i++;
            } else {
                //just continue find  
                i++;
            }
        }

        //now fetch result 
        var ret = [];
        if (firstPos !== -1) {
            ret.push(exp.substring(0, firstPos).trim());
            if (secondPos !== -1) {
                ret.push( exp.substring(firstPos+1, secondPos).trim());
                ret.push( exp.substr(secondPos+1).trim());
            } else {
                ret.push("Can't find then clause for: " + exp.substr(firstPos+1));
                ret.push("");
            }
        } else {
            ret=['Parse Error for: ' + content, "", ""];
        } 
        return ret; 
    },

    getExpressionType: function ( exp ) {
        var ret = he.Express.Simple;
        if ( exp.substr(0,2).toLowerCase()==='if') {
            ret = he.Express.If;
        } else if (exp.substr(0,2).toLowerCase()==='case') {
            ret = he.Express.Case;
        } else {
            //try to get inside : 
            //!! need considerate check the if|IF case|CASE not inside the '' 
            var str = exp.replace( /'[^']*'/g, ""); 
            var r = /(if|IF)\s*\(/;
            var match = r.exec(str);
            if (match) {
                ret = he.Express.Mixed;
            } 
        }

        return ret;
    },


    isComplexExpression: function(exp) {
        var type = this.getExpressionType(exp);
        return type !== he.Express.Simple;
    },

    formatComplexExpression: function(exp) {
        var expression = he.util.ExpresssionFactory.createExpression(exp);
        return expression.format();
    }, 

    // if( ( "NetDueDate" <= "KeyDate" and "NetDueDate" >= "KeyDate_1" ) ,"DMBTR",0)
    // adddays("KeyDate", -2 * $$P_AgingGridMeasureInDays$$)

    /**
     * add style for the calculated column to show in one simple control,
     * now support column, key word, string, keyword
     * @param  {[type]} exp [description]
     * @return {[type]}     [description]
     */
    formatSimpleExpression: function(exp) {
        //return:  {block:,  blockType, nextPosition:}
        var ret = "<span>";
        var i=0;
        while (i < exp.length) {
            var blockInfo = this._getBlock(exp, i);

            var aStyle = this._getBlockStyle(blockInfo.blockType, blockInfo.block);
            if (aStyle.length) {
                ret += aStyle[0] + blockInfo.block + aStyle[1];
            } else {
                ret += blockInfo.block;
            }
            // ret += this._formatBock(blockInfo.blockType, blockInfo.block);

            //move next 
            i = blockInfo.nextPos;
        }
        ret +="</span>";

        return ret;
    }
};


/*.ExpKeyword {
    color: blue;
}
.ExpColumn {
    color: gray;
}
.ExpString {
    color: gray;
}
*/
he.util.Expresssion = function(content) {
    this.content = content;
};

he.util.Expresssion.prototype.parse = function() {
    alert('base parse');
};

he.util.Expresssion.prototype.format=function() {
    // alert('base format');
    //for the normal, just simple format 
    return he.util.ExpressionHelper.formatSimpleExpression(this.content);
};

he.util.IfExpresssion = function(content) {
    he.util.Expresssion.call(this,content);
    this.conditionPart = null;
    this.thenPart = null;
    this.elsePart = null;

    this.parse();
};

he.util.IfExpresssion.prototype = new he.util.Expresssion();

he.util.CaseExpresssion = function(content) {
    he.util.Expresssion.call(this,content);
};
he.util.CaseExpresssion.prototype = new he.util.Expresssion();

he.util.MixedExpresssion = function(content) {
    he.util.Expresssion.call(this,content);
};
he.util.MixedExpresssion.prototype = new he.util.Expresssion();

he.util.MixedExpresssion.prototype.format = function(){
    //need first split it into several part: normal + complex, then format them and add together
    var str = this.content;
    //!! need considerate check the if|IF case|CASE not inside the '' 
    // var str = exp.replace( /'[^']*'/g, ""); 
    var r = /(if|IF)\s*\(/;
    var match;
    var ret="";
    var pos;
    var headPartStr,  ifPartStr, ifPartEndPos;
    var expression;

    while (true) {
        //try to find the inside if/case clause, then add the previous, for the next part contine the process
        match = r.exec(str);
        if (match) {
            pos = str.indexOf(match[0]);
            //previous part is normal, just simple way 
            headPartStr = str.substring(0, pos);
            expression = new he.util.Expresssion(headPartStr);
            ret += expression.format(); 

            //then the if part 
            str = str.substr(pos);
            ifPartEndPos = he.util.ExpressionHelper.getIfExpressionString(str,0);
            ifPartStr = str.substr(0, ifPartEndPos+1);
            expression = new he.util.IfExpresssion(ifPartStr);
            ret += expression.format(); 

            //then the remain part, as it may have another if, so just change the str and continue process 
            str = str.substr(ifPartEndPos+1);            
        } else {
            //so is an normal expression 
            expression = new he.util.Expresssion(str);
            ret += expression.format();             
            break;
        }
    }
    return ret;
};

he.util.ExpresssionFactory = {
    createExpression: function(content) {
        var type = he.util.ExpressionHelper.getExpressionType(content);
        var ret;
        switch (type) {
            case he.Express.If: 
                ret = new he.util.IfExpresssion(content);
                break;
            case he.Express.Case: 
                ret = new he.util.CaseExpresssion(content);
                break;
            case he.Express.Mixed: 
                ret = new he.util.MixedExpresssion(content);
                break;
            case he.Express.Simple: 
                ret = new he.util.Expresssion(content);
                break;
            default:
                break;
        }
        return ret;
        
/*        if ( content.substr(0,2).toLowerCase()==='if') {
            return new he.util.IfExpresssion(content);
        } else if (content.substr(0,2).toLowerCase()==='case') {
            return new he.util.CaseExpresssion(content);
        } else {
            return new he.util.Expresssion(content);
        }
*/    }
};


he.util.IfExpresssion.prototype.parse = function() {
    //first split it into three part, then one by one parse again
    var arr = he.util.ExpressionHelper.parseIfExpression(this.content);
    this.conditionPart = he.util.ExpresssionFactory.createExpression(arr[0]);
    this.thenPart = he.util.ExpresssionFactory.createExpression(arr[1]);
    this.elsePart = he.util.ExpresssionFactory.createExpression(arr[2]);
};

he.util.IfExpresssion.prototype.format = function() {
    var ret = '<table border="1"> <tr> <td class="ExpIf">If Condition</td> <td>';

    ret += this.conditionPart.format();
    ret += "</td> </tr>";

    ret += "<tr> <td class='ExpThen'>Then</td> <td>";
    ret += this.thenPart.format();
    ret += "</td> </tr>";

    ret += "<tr> <td class='ExpElse'>Else</td> <td>";
    ret += this.elsePart.format();
    ret += "</td> </tr> </table>";

    return ret;
};

/*
exp = "IF( \"REBZT\" = '' or \"REBZT\" = 'V' or \"REBZT\" ='P' or isnull(\"BLDAT_Ref\") ,IF( \"ZFBDT\" != '00000000' and \"ZFBDT\" != '', replace(string(adddays(if(\"ZFBDT\" = '00000000' or \"ZFBDT\" = '', daydate(\"BLDAT\"), daydate(\"ZFBDT\")), int( IF( (\"KOART\" = 'D' AND \"SHKZG\" = 'H' OR ( \"KOART\" = 'K' AND \"SHKZG\" = 'S')) AND \"REBZG\" = '', 0, IF(\"ZBD3T\" != 0, \"ZBD3T\", IF(\"ZBD2T\" != 0, \"ZBD2T\",\"ZBD1T\")))))), '-', ''), ''),IF( \"ZFBDT_Ref\" != '00000000' and \"ZFBDT_Ref\" != '' , replace(string(adddays(if(\"ZFBDT_Ref\" = '00000000' or \"ZFBDT_Ref\" = '', daydate(\"BLDAT_Ref\"), daydate(\"ZFBDT_Ref\")), int( IF( \"SHKZG_Ref\" = 'S' AND \"REBZG_Ref\" = '', 0, IF(\"ZBD3T_Ref\" != 0, \"ZBD3T_Ref\", IF(\"ZBD2T_Ref\" != 0, \"ZBD2T_Ref\",\"ZBD1T_Ref\")))))), '-', ''), ''))"
var regexp = /(if|IF)\s*\(/;

he.util.ExpressionHelper.formatComplexExpression(exp)
*/