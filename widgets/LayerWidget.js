require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dijit/Tree", "dijit/tree/ForestStoreModel", "dojo/data/ItemFileWriteStore", "dijit/tree/dndSource", "dojo/io/script", "dojo/dom-construct", "dojo/text!./widgets/templates/animwidgetlayer.html", "dojo/_base/json"], function(declare, _Widget, _Templated, Tree, ForestStoreModel, ItemFileWriteStore, dndSource, script, domConstruct, template) {

    return declare("widgets.LayerWidget", [_Widget, _Templated], {

        rootNode : "LayerRoot",
        layerPrefix : "layer",
        templateString : template,
        selectedItem : undefined,
        contextMenuItems : {
            "delete" : {
                name : "Delete Layer"
            },
            "rename" : {
                name : "Rename Layer"
            }
        },

        postCreate : function() {
            var that = this;

        },
        startup : function() {
            dojo.subscribe("/animwidget/initStage", this, "onInitStage");
            dojo.subscribe("/animwidget/addObject", this, "onAddObject");
            dojo.subscribe("/animwidget/selectObject", this, "onSelect");
            // Request the initialization of the Stage
            dojo.publish("/animtimelinewidget/requestInitStage", []);
        },
        /** Is called when another widget has made a selection so the selected layer has to be shown in the layerWidget */
        onSelect : function(element) {
            if (element !== undefined) {
                var currElem = element;
                var path = [];
                while (currElem !== undefined && currElem.getId() !== undefined) {

                    path.push("layer" + currElem.getId());
                    currElem = currElem.getParent();
                }
                path.push(this.rootNode);
                path = path.reverse();
                this.layerTree.attr('path', path);
            } else {
                this.layerTree.dndController.selectNone();
            }
        },
        /** Creates recursively Layers for a node with all their childNodes */
        createLayer : function(node, parent, store) {
            if (node !== undefined) {

                var itemData = {
                    id : "layer" + node.getId(),
                    name : node.getName()
                };
                var parentStore = {};
                if (parent != null) {
                    parentStore = {
                        parent : parent,
                        attribute : 'children'
                    };
                }
                var item = store.newItem(itemData, parentStore);
                store.save();
                var children = [];
                for (var index in node.children) {
                    this.createLayer(node.children[index], item, store);
                }

                if (children.length > 0) {
                    item.children = children;
                }
                return item;
            }
            return undefined;
        },
        onAddObject : function(obj) {
            var createLayer = this.createLayer;
            var layerStore = this.layerStore;
            var onFoundParent = function(items, request) {
                var item = createLayer(obj, items[0], layerStore);
                dojo.publish("/layerwidget/selectLayer", [obj.getId()]);
            };
            var onError = function() {
                console.log("Error getting parent");
            };

            this.layerStore.fetch({
                query : {
                    id : "layer" + obj.parent.getId()
                },
                onComplete : onFoundParent,
                onError : onError,
                queryOptions : {
                    deep : true
                }
            });
        },

        selectItemTreeMenu : function(e) {
            var itemId;
            var change = {};
            var menuItem = dijit.getEnclosingWidget(e.target);
            if (menuItem.id == "delete") {
                this.layerStore.deleteItem(this.selectedItem);
                itemId = this.selectedItem.id[0].replace("layer", "");
                change.deleteObject = true;
            } else if (menuItem.id == "rename") {
                var newName = window.prompt("Set the name of the current layer", this.selectedItem.name);
                if (newName !== null) {
                    this.layerStore.setValue(this.selectedItem, "name", newName);
                    itemId = this.selectedItem.id[0].replace("layer", "");
                    change.name = newName;
                }
            }

            var obj = this.stage.findById(parseInt(itemId));

            dojo.publish("/layerwidget/updateObject", [change, obj]);

        },

        /** Is called when the AnimEn is loaded and the layer should be shown */
        onInitStage : function(root) {
            this.stage = root;
            if (this.layerStore != undefined) {
                // If this is not the first time the Widget is initialized the old layers have to be destroyed
                this.layerTree.destroyRecursive();
                this.layerTreeMenu.destroyRecursive();

                dojo.create("div", {
                    id : "layerList"
                }, this.domNode);

            }
            // Init the layers
            this.init();

            for (var index in root.children) {// iterate all children and create layer for them
                var item = this.createLayer(root.children[index], null, this.layerStore);
            }

        },

        init : function() {
            this.layerStore = new ItemFileWriteStore({
                data : {
                    identifier : 'id',
                    label : 'name',
                    items : []
                }
            });
            var that = this;
            this.layerModel = new ForestStoreModel({

                pasteItem : function(/*Item*/childItem, /*Item*/oldParentItem, /*Item*/newParentItem, /*Boolean*/bCopy, /*int?*/insertIndex) {

                    dijit.tree.ForestStoreModel.prototype.pasteItem.apply(this, arguments);

                    var itemId = childItem.id[0].replace("layer", "");
                    var oldParentId = oldParentItem.id[0].replace("layer", "");
                    var newParentId;
                    if (newParentItem.id !== "LayerRoot") {
                        newParentId = newParentItem.id[0].replace("layer", "");
                    }

                    dojo.publish("/layerwidget/updateLayerPosition", [itemId, oldParentId, newParentId]);

                    if (newParentItem.id === "LayerRoot") {
                        // Add the layer to the correct position
                    }

                    this.store.save();
                },

                store : this.layerStore,
                rootId : this.rootNode,
                rootLabel : "Stage",
                childrenAttrs : ["children"]
            });

            this.layerTree = new dijit.Tree({
                model : this.layerModel,
                dndController : dijit.tree.dndSource,
                showRoot : true,

            }, "layerList");

            this.layerTree.on("mousedown", function(event) {
                event.preventDefault();
                return false;
            }, false);

            // Create Context menu
            this.layerTreeMenu = new dijit.Menu();
            for (var menuId in this.contextMenuItems) {
                var name = this.contextMenuItems[menuId].name;
                var menuItem = new dijit.MenuItem({
                    id : menuId,
                    label : name,
                    disabled : false
                });
                dojo.connect(menuItem, "onClick", this, this.selectItemTreeMenu);
                this.layerTreeMenu.addChild(menuItem);
            }

            this.layerTreeMenu.bindDomNode("layerList");

            dojo.connect(this.layerTreeMenu, "_openMyself", this, this.onSelectTreeNode);

            this.layerTree.on("click", function(object) {
                // node was clicked so the layer should be selected
                var id = object.id[0].replace("layer", "");
                dojo.publish("/layerwidget/selectLayer", [id]);
            }, false);
        },

        onSelectTreeNode : function(e) {
            var treeNode = dijit.getEnclosingWidget(e.target);
            this.selectedItem = treeNode.item;
        }
    });

});
