

require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "dojo/dom-class", "dojo/text!./widgets/templates/resourceitem.html", "engine/ResourceManager"],
        function(declare, _Widget, _Templated, script, domConstruct, domClass, template, ResourceManager) {
     
	declare("widgets.ResourceItem", [_Widget, _Templated], {
	    templateString: template,
	    
	    resourceKey:"",
        resourceSrc:"",
	    resourceImg:null,
	    readonly:true,
	    
		postCreate: function() {
		},
		
		startup: function() {
            var saveResourceNode = dojo.query(".saveResource", this.domNode)[0];
            var deleteResourceNode = dojo.query(".deleteResource", this.domNode)[0];
		    this.imgNode = dojo.byId(this.resourceKey);
		    if (this.imgNode !== null && this.resourceImg !== null) {
		        this.imgNode.appendChild(this.resourceImg);
		    }
            this.valueKeyNode = dojo.query(".valueKey", this.domNode)[0];
            this.valueSrcNode = dojo.query(".valueSrc", this.domNode)[0];
		    if (!this.readonly && this.imgNode != null) {
                this.valueKeyNode.removeAttribute("readonly");
                this.valueSrcNode.removeAttribute("readonly");
                domClass.remove(saveResourceNode, "hidden");
                domClass.remove(deleteResourceNode, "hidden");
		    } else {
                domClass.add(saveResourceNode, "hidden");
                domClass.add(deleteResourceNode, "hidden");
		    }
            
            dojo.connect(saveResourceNode, "onclick", this, this.saveResourceItem);
            
            dojo.connect(deleteResourceNode, "onclick", this, this.deleteResourceItem);
		},
        
        saveResourceItem: function() {
            if (this.valueKeyNode.value != this.resourceKey || this.valueSrcNode.value != this.resourceSrc) {
                ResourceManager.removeLocalResource(this.resourceKey);
                this.resourceKey = this.valueKeyNode.value;
                this.resourceSrc = this.valueSrcNode.value;
                ResourceManager.addLocalResource(this.resourceKey, this.resourceSrc);
                this.resourceImg = ResourceManager.getResource(this.resourceKey);
                if (this.imgNode !== null && this.resourceImg !== null) {
                    dojo.empty(this.imgNode);
                    this.imgNode.appendChild(this.resourceImg);
                    //this.imgNode.id = this.resourceKey;
                }
                
                dojo.publish("/resourceitem/updateResource", [this.resourceKey, this.resourceSrc]);
            }
        },
        
        deleteResourceItem: function() {
            
            if ('localStorage' in window && window['localStorage'] !== null && localStorage.getItem("resources") !== null) {
                localResources = JSON.parse(localStorage.getItem("resources"));
                
                if (localResources[this.resourceKey] != null) {
                    delete localResources[this.resourceKey];
                    
                    localStorage.setItem("resources", JSON.stringify(localResources));
                }
            }
            
            ResourceManager.removeResource(this.resourceKey);
            this.destroyRecursive(false);
            
        },
		
		
		initResources: function() {
		}
		
    });
     
});


