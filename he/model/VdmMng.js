var gStart = 0,
    gEnd = 100;
he.model.VdmMng = {
    init: function(evt) {
        // this.buildEccVdm();
        this.mContent = he.preLoadVdm;
    },

    /**
     * Add one parsed vdmData to the content, so later can mng it easily!!
     * @param {[type]} pkg     [description]
     * @param {[type]} vdmName [description]
     * @param {[type]} vdmData [description]
     */
    addVdm: function(pkg, vdmName, vdmData) {
        var parent = this.buildBasicStructure(pkg, vdmName);

        //add the name also, for later easy access
        vdmData.name = vdmName;

        parent[vdmName] = vdmData;
    },

    /**
     * build the vdm under ecc package
     * @return {[type]}
     */
    buildEccVdm: function() {
        var pkg = "sap.hba.ecc";
        var vdms = he.eccVdms;
        var max = Math.min(gEnd, vdms.length);
        for (var i = gStart; i < max; i++) {
            var vdm = vdms[i];

            var vdmData = he.model.Vdm.parseLocalVdm(pkg, vdm);

            this.addVdm(pkg, vdm, vdmData);

            console.log('Done for ', vdm);
        }
    },

    buildEccVdm_2: function() {
        var pkg = "sap.hba.ecc";
        var vdms = he.eccVdms;
        for (var i = 0; i < vdms.length; i++) {
            var vdm = vdms[i];

            var parent = this.buildBasicStructure(pkg, vdm);

            var data = he.model.Vdm.parseLocalVdm(pkg, vdm);

            parent[vdm] = data;

            console.log('Done for ', vdm);
        }
    },
    /**
     * build the basic structure
     *
     **/
    buildBasicStructure: function(pkg, vdm) {
        if (!(pkg in this.mContent)) {
            this.mContent[pkg] = {
            };
        }

        /*//as maybe load multiple time, so need check whether name is there
        if (this.mContent[pkg].aVdm.indexOf(vdm) == -1) {
            this.mContent[pkg].aVdm.push(vdm);
        }
    */
        return this.mContent[pkg];
    },

    getVdmData: function(pkg, vdm) {
        return this.mContent[pkg][vdm];
    },

    getContent: function() {
        return this.mContent;
    },

    addDefaultProp: function(entry, aName) {
        for (var i = 0; i < aName.length; i++) {
            var name = 'n' + i;
            entry[name] = '';
        }
    },

    /**
     * Create a new array hold the name like c0~~~cn from the entry
     * @param  {[type]} entry [description]
     * @param  {[type]} aName [description]
     * @return {[type]}       [description]
     */
    getNameArray: function(entry, aName) {
        var arr = [];
        for (var i = 0; i < aName.length; i++) {
            var name = 'n' + i;
            arr.push(entry[name]);
        }
        return arr;
    },

    /**
     * Add a new node to the parent
     * @param {[type]} parent [description]
     * @param {[type]} name   [description]
     * @param {[type]} type
     * @return   -- the new created entry
     */
    /*addNodeUnderParent: function (parent, uri, name, type, type2, aName) {
        var entry = {'name': name, 'type': type, type2: type2};
        this.addDefaultProp(entry, aName);

        //the parent may or may not have the children, so need check here
        if ( ! ('children' in parent)) {
            parent['children'] = [];
        }
        parent['children'].push(entry);
        return entry;
    },*/

    addNodeToParent: function(parent, entry) {
        //the parent may or may not have the children, so need check here
        if (!('children' in parent)) {
            parent.children = [];
        }
        parent.children.push(entry);
        return entry;
    },

    buildOneNodeForAnalyze: function(mTree, vdmData, viewData, aName, bRecursive) {
        //as in the beginning, we don't know how many node it may be depend on, so first need build one by one
        //then after all finished, we know how many node it need add
        var needAdd, subView;
        var entry0 = {}, entry1 = {};
        var add0 = false,
            add1 = false;
        this.addDefaultProp(entry0, aName);
        this.addDefaultProp(entry1, aName);

        //get the names relationship
        for (var i = 0; i < aName.length; i++) {
            var name = aName[i];
            if (name === "")
                continue; //may be till now is ended

            var iAttr = viewData.aAttr.sapIndexOf('name', name);
            if (iAttr != -1) {
                var attrEntry = he.addDefaultAttrProp(viewData.aAttr[iAttr]);
                //here also take into account of the leftOuter rightOuter join, only one leg will be added
                if (attrEntry.i0 !== "" && attrEntry.n0 !== "") {
                    needAdd = true;
                    if (he.isJoinNode(viewData.nodeType) && viewData.joinType == he.JoinType.RightOuter)
                        needAdd = false;

                    if (needAdd) {
                        add0 = true;
                        entry0['n' + i] = attrEntry.n0;
                    }
                }

                if (attrEntry.i1 && attrEntry.n1) {
                    needAdd = true;
                    if (he.isJoinNode(viewData.nodeType) && viewData.joinType == he.JoinType.LeftOuter)
                        needAdd = false;

                    if (needAdd) {
                        add1 = true;
                        entry1['n' + i] = attrEntry.n1;
                    }
                }

            } else {
                he.assert(false, "why in buildOneNode from name " + name + " can't find in aAttr");
            }
        }

        var arrName;
        //when do it to the next level
        //??if recurisve the need considerate whether the view loaded or not
        if (add0) {
            var input0 = viewData.aInput[0];
            subView = this.getSubViewData(vdmData, viewData, input0);
    
            this.copyNodeNameAndType(subView, entry0);
           
            this.addNodeToParent(mTree, entry0);
            
            if ( he.isNotLeafNode(subView.nodeType)) {
                arrName = this.getNameArray(entry0, aName);
                this.buildOneNodeForAnalyze(entry0, vdmData, subView, arrName, bRecursive);
            }
        }

        if (add1) {
            var input1 = viewData.aInput[1];
            subView = this.getSubViewData(vdmData, viewData, input1);
    
            this.copyNodeNameAndType(subView, entry1);
           
            this.addNodeToParent(mTree, entry1);
            
            if ( he.isNotLeafNode(subView.nodeType)) {
                arrName = this.getNameArray(entry1, aName);
                this.buildOneNodeForAnalyze(entry1, vdmData, subView, arrName, bRecursive);
            }
        }
    },

    /**
     * Copy the nanme, nodeType (and nodeType2 ) to entry
     * @param  {[type]} viewData [description]
     * @param  {[type]} entry    [description]
     * @return {[type]}          [description]
     */
    copyNodeNameAndType: function ( viewData, entry ) {
        entry.name = viewData.name;
        entry.nodeType = viewData.nodeType;
        if ( he.isLogicNode(viewData.nodeType)){
            entry.nodeType2 = viewData.nodeType2;
        }
    },

    /**
     * Check whether is the leaf node under one tree
     * @param  {[type]}  nodeName [description]
     * @param  {[type]}  m        [description]
     * @return {Boolean}          [description]
     */
  /*  isLeafNodeByName: function(vdmData, nodeName) {
        //if in the aDepVdm or aDepTbl then is the leaf, other is the normal node
        var idx = vdmData.aDepTbl.indexOf(nodeName);
        if (idx == -1) {
            idx = vdmData.aDepVdm.indexOf(nodeName);
        }
        return idx != -1;
    },*/
    getSubViewData: function(vdmData, viewData, inputName) {
        var nodeType = viewData.nodeType;
        if (he.isSemaNode(nodeType)) {
            return vdmData.logicModel;
        }
        //others just by name 
        return vdmData.mView[inputName];
    },

    /**
     * put it here instead of in VdmTree is for later extensibility: so can do analyze from hana tree, and can get it recurisive
     * need avoid use the Tree or TreeNode functions ( as if recursively then that tree is not loaded)
     * @param  {[type]} vdmData    [description]
     * @param  {[type]} viewData   [description]
     * @param  {[type]} aName      [description]
     * @param  {[type]} bRecursive [description]
     * @return {[type]}            [description]
     */
    getCompactAnalyzeData: function(vdmData, viewData, aName, bRecursive) {
        var mTree = {
            children: []
        };
        this.buildOneNodeForAnalyze(mTree, vdmData, viewData, aName, bRecursive);
        return mTree;
    },


    /*  mData: {
        'sap.hba.ecc': {
            aVdm: [],
        },
    }
*/
    mContent: {},
    mCategory: {},
};

var gstr;

function ginit() {
    he.model.VdmMng.buildEccVdm();
    //then write to file
    gstr = JSON.stringify(he.model.VdmMng.getContent());
    var name = 'ecc_' + gStart + "_" + gEnd + '.json';
    he.util.io.saveToFile(gstr, name);
}

//??only dbg
var gm = he.model.VdmMng;