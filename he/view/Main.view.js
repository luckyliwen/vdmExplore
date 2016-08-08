sap.ui.jsview("he.view.Main", {

    getControllerName: function() {
        return "he.controller.Main";
    },

    createContent: function(oController) {

        this._oShell = this.createShell(oController);
        this.createStaticViews(oController);

        //default is the Pkg view
        this._oShell.setContent(this._pkgView);

        return this._oShell;
    },

    /* data like var m = {
            title: title,
            modelData: modelData,
            aHead:  aName,
        };*/
    createNewAnalyze: function ( data ) {
        var view = new he.view.Analyze({
            viewName:   'he.view.Analyze',  //??used to find out the view
        });
        view.doInit(data);
        
        //if view name like view.home, the the navigation item id is: ni_viewhom  
        var id = this.createNaviItemId();
        this._mView[id] = view;
        
        //also need create new sap.ui.ux3.NavigationItem
        this.addNewWorksetItem(id, view, data.title);

        this.activateView(id);
    },

    addNewWorksetItem:function ( id, view, text) {
        var navItem = new sap.ui.ux3.NavigationItem(id, 
        {
            key: id, 
            text: text,
        });
        this._oShell.addWorksetItem(navItem);

        this._mView[id] = view;
    },

    /**
     * Now the package is static,
     */
    createStaticViews: function() {
        this._pkgView = new he.view.Pkg("ViewPkg", {
            viewName: 'he.view.Pkg'
        });
        this._pkgView.doInit();
        this._mView.NavItem_Pkg = this._pkgView;

        this._unitTestView = new he.view.UnitTest("ViewUnitTest", {
            viewName: 'he.view.UnitTest'
        });
        this._unitTestView.doInit();
        this._mView.NavItem_UnitTest = this._unitTestView;

    },

    /**
     * As it is simple and only take care of switch between navigation items so put here
     * @param oEvent
     */
    onWorksetItemSelected: function(oEvent) {
        var id = oEvent.getParameter("id");
        var oShell = oEvent.oSource;

        var view = this._mView[id];
        oShell.setContent(view);
    },


    createShell: function(oControl) {
        var oShell = new sap.ui.ux3.Shell("mainShell", {
            appTitle: "SAP Hana Explore",
            appIcon: "images/SAPLogo.png",
            appIconTooltip: "SAP Hana Explore",

            headerType: sap.ui.ux3.ShellHeaderType.Standard,
            fullHeightContent: false,

            //left part
            showLogoutButton: false,
            showSearchTool: false,
            showInspectorTool: false,
            showFeederTool: false,

            worksetItems: [

                new sap.ui.ux3.NavigationItem("NavItem_Pkg", {
                    key: "NavItem_Pkg",
                    text: "VDM Explore"
                }),

                new sap.ui.ux3.NavigationItem("NavItem_UnitTest", {
                    key: "NavItem_UnitTest",
                    text: "Unit Test Assistant"
                }),
            ],

            headerItems: [
                new sap.ui.commons.Button({
                    text: "Setting",
                    //icon: "images/LeftNavi_Alert_Button.png",
                    lite: true,
                    press: [oControl.onSettingPressed, oControl]
                }),

                new sap.ui.commons.Button({
                    text: "Help",
                    //icon: "images/LeftNavi_Alert_Button.png",
                    lite: true,
                    press: [oControl.onHelpPressed, oControl]
                }),
            ]
        });

        oShell.attachWorksetItemSelected(this.onWorksetItemSelected, this);

        return oShell;
    },


    /**
     * viewInfo need contain: { ViewName: xx,  ControllerName: xx }
     * @param viewInfo
     */

/*    createViewWorkset: function(viewInfo) {
        var view = new he.view.ViewWorkset({
            viewName: 'he.view.ViewWorkset', //??used to find out the view

            nameOfView: viewInfo.ViewName,
            nameOfController: viewInfo.ControllerName,

            viewCtrlNodeContent: viewInfo.viewCtrlNodeContent,
        });
        view.doInit();

        //if view name like view.home, the the navigation item id is: ni_viewhom  
        var id = this.getNaviItemIdByViewName(viewInfo.ViewName);
        this._mView[id] = view;

        //also need create new sap.ui.ux3.NavigationItem
        var navItem = new sap.ui.ux3.NavigationItem(id, {
            key: id,
            text: "View " + viewInfo.ViewName
        });
        this._oShell.addWorksetItem(navItem);

        //by the id can control view, so need return it
        return id;
    },

*/  
    activateView: function(id) {
        he.view.Helper.simulateControlClicked(id);
    },

    createNaviItemId: function() {
        this._gViewIdx++;
        return 'NavItem_View_' + this._gViewIdx;
    },

    //??
    _gViewIdx: 0,

    //==main data 
    _oShell: null,
    _pkgView: null,

    //contain all the views, id is the view name
    _mView: {},
});
