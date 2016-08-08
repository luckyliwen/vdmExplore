sap.ui.commons.Tree.extend("he.uilib.VdmTree", {
    metadata : {
        properties : {
        },

        events : {}
    },

    doInit:function ( evt ) {
        this.aHigLightJQItem = [];
        // this.aHightlightNode = [];
        this.aTrackedNode = [];
    },

    renderer : 'sap.ui.commons.TreeRenderer',

    gotoPairNode: function ( node ) {
        var pair = node.getPairNode();
        if (pair) {
            this.setSelection(pair);
        }
    },

    /**
     * High light the pairs node, so user easy know the relationship
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    highlightPair:function ( node ) {
        this.clearHightlight();

        var parent = node.getParent( );
        var nodes = parent.getNodes();
        if (nodes.length > 1) {
            //this.aHightlightNode = nodes;    
            // this.aHightlightNode.forEach( function(n) {
            //     //n.setPairText();
            // });
            for (var i = 0; i < nodes.length; i++) {
                var title = nodes[ i ].getText() ; 
                var $item = he.TreeHelper.findJQueryItemByTitle(this.getId(), title);
                var oldBorder = $item.css('border');
                
                this.aHigLightJQItem.push( {jqItem: $item, borderCss: oldBorder});

                //set the new 
                $item.css('border', '1px dotted red');
            }
        }
    },

    clearHightlight: function ( ) {
        // this.aHightlightNode.forEach( function(node) {
        //     //node.clearPairText();
        // });
        // this.aHightlightNode = [];
        this.aHigLightJQItem.forEach(function(e) {
            e.jqItem.css('border', e.borderCss);
        });
        this.aHigLightJQItem = [];
    },

    

    trackPath: function ( name, vdmData) {
        this.clearTrack();
        
        this.aTrackedNode = [];
        var selNode = this.getSelection();

        this.trackPathForNode( selNode, name, vdmData);

        //then for all the tracked node track it
        this.aTrackedNode.forEach( function(node) {
            node.trackNode();
        });
    },

    clearTrack: function () {
        this.aTrackedNode.forEach( function(node) {
            node.clearTrack();
        });
        this.aTrackedNode = [];
    },

    trackPathForNode: function ( node, name, vdmData) {
        this.aTrackedNode.push(node);

        var viewData = node.getViewByNode(vdmData);

        var iAttr, attrEntry , needAdd;
        if ( node.isLeaf()) {
            iAttr = viewData.aAttr.sapIndexOf('n0', name);
            //??here need considerate the calculated column ??
            if (iAttr ==-1) {
                he.assert( false, "for leaf by the n0 can't find idx");
                return ;
            }
            attrEntry = viewData.aAttr[ iAttr];
            node.setMapType(attrEntry.map);
            node.setTargetName( attrEntry.name);
            node.addExtraText( attrEntry.n0 );
        } else {
            iAttr = viewData.aAttr.sapIndexOf('name', name);
            
            if (iAttr ==-1) {
                //may be it is an calculated column, so need track
                //!! as not for the calculated column it may have relationship with so many other column, 
                //??how to support continue track down ?? 
                var iCalc = viewData.aCalc.sapIndexOf('id', name);
                if (iCalc !== -1 ) {
                    // node.setMapType( he.MapType.Normal);
                    // node.setTargetName( name);
                    // if the calculated related only one attr, then use that attr to track down 
                    if ( viewData.aCalc[iCalc].aRelatedAttr.length ==1) {
                        //then use that related attr name to search again 
                        var relatedAttrName = viewData.aCalc[iCalc].aRelatedAttr[0];
                        iAttr = viewData.aAttr.sapIndexOf('name', relatedAttrName);
                        if (iAttr == -1) {
                            jQuery.sap.assert(false, "by the related attr name can't find in aAttr");
                        } 
                    } else {
                        //more than one related attr, just set 
                        node.setMapType( he.MapType.Normal);
                        node.setTargetName( name);
                    }
                } else {
                    jQuery.sap.assert(false,' both iCalc and iCalc is -1');
                }
            }

            if (iAttr == -1) {
                return;
            }

            attrEntry = viewData.aAttr[ iAttr];

            node.setMapType(attrEntry.map);
            node.setTargetName( name);


            var aChild = node.getNodes();

            //??how to set status need adjust later
            if ( attrEntry.i0  && attrEntry.n0 ) {
                //must have the children
                node.addExtraText(attrEntry.n0);
                if ( aChild.length) {
                    needAdd = true;
                    //for the join, only need get one leg, so by the joinType can check which leg
                    if ( he.isJoinNode(node)) {
                        //for the left or right just choose one
                        if ( viewData.joinType == he.JoinType.RightOuter)
                            needAdd = false;
                    }
                    if (needAdd) {
                        this.trackPathForNode(aChild[0], attrEntry.n0, vdmData);
                    }
                }
                
            }

            if ( attrEntry.i1  && attrEntry.n1 ) {
                he.assert( aChild.length ==2);
                node.addExtraText(attrEntry.n1);

                if ( aChild.length>1) {
                    needAdd = true;
                    //for the join, only need get one leg, so by the joinType can check which leg
                    if ( he.isJoinNode(node)) {
                        //for the left or right just choose one
                        if ( viewData.joinType == he.JoinType.LeftOuter)
                            needAdd = false;
                    }
                    if (needAdd) {
                        this.trackPathForNode(aChild[1], attrEntry.n1, vdmData);
                    }
                }
            }
        }
        
    },


    //the nodes need reset
    aHightlightNode: null,

    aTrackedNode: null,
});