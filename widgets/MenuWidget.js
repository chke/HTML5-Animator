

require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "dojo/text!./widgets/templates/menuwidget.html", "dojo/_base/json", "dijit/MenuBar", "dijit/PopupMenuBarItem", "dijit/MenuSeparator", "dijit/Menu", "dijit/MenuItem"],
        function(declare, _Widget, _Templated, script, domConstruct, template) {
     
	return declare("widgets.MenuWidget", [_Widget, _Templated], {
	    templateString: template,
	    rootNode: "LayerRoot",
	    menuJson: {
	        "MenuItems": {
    	        "Project": {
    	            "MenuItems": {
    	                "New": {
    	                    "onClick": function() {
    	                       dojo.publish("/menuwidget/newProject", []);
    	                    }
    	                    
    	                },
                        "Reset": {
                            "onClick": function() {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }
    	            }
    	            
    	        }, "Edit": {
                    "MenuItems": {
                        /*"Sep":{},*/
                        "Create": {
                            "MenuItems": {
                                "DisplayObject": {
                                    "onClick": function() {
                                        dojo.publish("/menuwidget/addObject", ["DisplayObject"]);
                                    }
                                },
                                "Sprite": {
                                    "onClick": function() {
                                        dojo.publish("/menuwidget/addObject", ["Sprite"]);
                                    }
                                },
                                "AnimationObject": {
                                    "onClick": function() {
                                        dojo.publish("/menuwidget/addObject", ["AnimObject"]);
                                    }
                                }
                                /*,
                                "Reference": {
                                    "onClick": function() {
                                        dojo.publish("/menuwidget/addObject", ["Reference"]);
                                    }
                                }*/
                            }
                        }
                    }
    	        }, "Animation": {
                    "MenuItems": {
                        "Start": {
                            "onClick": function() {
                                dojo.publish("/menuwidget/playAnimation", []);
                            }
                        },
                        "Start in new window": {
                            "onClick": function() {
                                var link = window.open('','_blank');
                                link.location="engine.html";
                            }
                        }
                    }
    	        }, "Help": {
    	            "MenuItems": {
                        "Info": {
                            "onClick": function() {
                                dijit.byId("infoDialog").show();
                            }
                        }
                    }
    	        }
    	    }
	    },
	    
		postCreate: function() {
		},
		
		startup: function() {
            this.createMenu(this.menuJson);
		},
		/**
		 * Creates an menu item recursively
		 */
		createMenuItemRec: function(item, parent, root) {
		    for (var subItem in item["MenuItems"]) {
		        var menuItem;
		        var subMenu;
		        if (subItem === "Sep") {
		            menuItem = new dijit.MenuSeparator({});
		        } else if (item["MenuItems"][subItem]["MenuItems"] != undefined) {
		            subMenu = new dijit.Menu({});
                    this.createMenuItemRec(item["MenuItems"][subItem], subMenu, false);
		            if (root) {
                        menuItem = new dijit.PopupMenuBarItem({
                            label:subItem,
                            popup:subMenu
                        });
                    } else {
                        menuItem = new dijit.PopupMenuItem({
                            label:subItem,
                            popup:subMenu
                        });
                    }
		        } else {
		            menuItem = new dijit.MenuItem({
                        label:subItem
                    });
                    if (item["MenuItems"][subItem]["onClick"] !== undefined) {
                        menuItem.onClick = item["MenuItems"][subItem]["onClick"];
                    }
		        }
		        
                
                parent.addChild(menuItem);
                
		    }
		},
		
		createMenu: function(menuJson) {
		    menuBar = new dijit.MenuBar({})
		    
		    this.createMenuItemRec(menuJson, menuBar, true);
		    
            menuBar.placeAt("menuWidget");
            menuBar.startup();
		},
		
    });
     
});


