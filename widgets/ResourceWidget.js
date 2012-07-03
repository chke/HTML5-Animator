

require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "engine/ResourceManager", "widgets/ResourceItem", "dojo/_base/json", "dijit/MenuBar", "dijit/PopupMenuBarItem", "dijit/MenuSeparator", "dijit/Menu", "dijit/MenuItem"],
        function(declare, _Widget, _Templated, script, domConstruct, ResourceManager, ResourceItem) {
    
	declare("widgets.ResourceWidget", [_Widget, _Templated], {
	    templateString: '<div style="height: 98%; width: 100%;"><div id="addResource" class="button">Add resource</div><div id="resourceWidget"></div></div>',
	    rootNode: "LayerRoot",
	    
	    resourceItems:{},
	    
	    currResItems:0,
	    
	    resourceDefaultName: "NewResource",
	    
	    resourceWidgetNode: null,
	    
		postCreate: function() {
		    dojo.create("link", {rel: "stylesheet", href: "./widgets/templates/css/resourcewidget.css" }, dojo.query("head")[0]);
		},
		
		startup: function() {
		    
		    var resources = ResourceManager.getResourceDict();
		    this.resourceWidgetNode = dojo.byId("resourceWidget");
		    
		    var localResources = {};
		    if ('localStorage' in window && window['localStorage'] !== null && localStorage.getItem("resources") !== null) {
                localResources = JSON.parse(localStorage.getItem("resources"));
            }
		    
		    
		    for (var key in resources) {
		        var readonly = true;
		        
		        if (localResources[key] != null) {
		            readonly = false;
		        }
		        
		        this.resourceItems[key] = new widgets.ResourceItem({resourceKey:key, resourceSrc:resources[key].src, resourceImg:resources[key], readonly:readonly});
		        
		        this.resourceWidgetNode.appendChild(this.resourceItems[key].domNode);
		        
		        this.resourceItems[key].startup();
		        
		        this.currResItems++;
		    }
		    
		    var addResourceNode = dojo.byId("addResource");
		    
		    // Connect click handler
		    dojo.connect(addResourceNode, "onclick", this, this.addResourceItem);
		},
		
		
		addResourceItem: function() {
		    var key = this.resourceDefaultName + this.currResItems;
		    
		    this.resourceItems[key] = new widgets.ResourceItem({resourceKey:key, readonly:false});
            
            this.resourceWidgetNode.insertBefore(this.resourceItems[key].domNode, this.resourceWidgetNode.firstChild);
            //.insertBefore(newFreeformLabel, container.firstChild);
            this.resourceItems[key].startup();
            
            this.currResItems++;
                
            
		},
		
		initResources: function() {
		},
		
    });
     
});


