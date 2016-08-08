he.uilib.ExpressionDialog = {
    /**
     * [showExpression description]
     * @param  {[type]} aCalc [description]
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    showExpression: function(aCalc, index) {
        if (this._oDialog === null) {
            this._createDialog();
        }
        this._aCalc = aCalc;
        this._curIdx = index;
        
        this._adjustContent();

        this._oDialog.open();
    },

    _adjustContent: function ( evt ) {
        this._adjustPrevNextBtnStatus();
        this._adjustExpressionContent();
        this._adjustTitle();
    },

    _adjustPrevNextBtnStatus: function(evt) {
        var len = this._aCalc.length;
        this._prevBtn.setEnabled(len > 1 && this._curIdx > 0);
        this._nextBtn.setEnabled(len > 1 && this._curIdx < (len - 1));
    },

    _adjustExpressionContent: function(evt) {
        if (!('bComplex' in this._aCalc[this._curIdx])) {
            //first time need check whether is complex or simple, and create then
            var flag = he.util.ExpressionHelper.isComplexExpression(
                this._aCalc[this._curIdx].formula
            );

            this._aCalc[this._curIdx].bComplex = flag;
            if (flag) {
                //only create it when really needed 
                this._aCalc[this._curIdx].complexExpression =
                    he.util.ExpressionHelper.formatComplexExpression(this._aCalc[this._curIdx].formula);
            }
        }

        var html;
        if (this._aCalc[this._curIdx].bComplex) {
            html = this._aCalc[this._curIdx].complexExpression;
        } else {
            html = this._aCalc[this._curIdx].expression;
        }

        this._expressionControl.setContent(html);
    },

     _adjustTitle: function ( ) {
        var title = this._aCalc[this._curIdx].id;
        title += " " + this._aCalc[this._curIdx].datatype;
        if ( this._aCalc[this._curIdx].datatypeExtra)
            title += " " + this._aCalc[this._curIdx].datatypeExtra;

        this._oTitle.setText(title);
    },


    /**
     * [_onPreviousOrNextRow description]
     * @param  {[type]} evt  [description]
     * @param  {[type]} flag -1 : previous, 1: next
     * @return {[type]}      [description]
     */
    _onPreviousOrNextPressed: function(evt, flag) {
        this._curIdx += flag;

        this._adjustContent();
    },

    _createDialog: function() {
        var that = this;
        var closeBtn = new sap.m.Button({
            text: 'Close',
            press: function() {
                that._oDialog.close();
            }
        });


        this._prevBtn = new sap.m.Button({
            text: 'Previous',
            type: 'Emphasized',
            press: [-1, this._onPreviousOrNextPressed, this]
        });

        this._nextBtn = new sap.m.Button({
            text: 'Next',
            type: 'Emphasized',
            press: [1, this._onPreviousOrNextPressed, this]
        });
        this._oTitle = new sap.m.Label({
                design: 'Bold'
        });

        var bar = new sap.m.Bar({
            contentLeft: this._prevBtn,
            contentMiddle: this._oTitle,
            contentRight: this._nextBtn
        });

        this._expressionControl = new sap.ui.core.HTML('ComplexExpressionHTML');
        this._oDialog = new sap.m.Dialog({
            // title:       "Choose library",
            content: this._expressionControl,
            'endButton': closeBtn,
            customHeader: bar
        });


    },

    _prevBtn: null,
    _nextBtn: null,
    _expressionControl: null, //the html 
    _aCalc: null,
    _curIdx: -1,
    _oDialog: null
};
