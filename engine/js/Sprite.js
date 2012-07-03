define(['engine/DisplayObject', "engine/ResourceManager"], function(DisplayObject, ResourceManager) {
 
    // constructor
    function Sprite(settings) {
        var animObjs = {};
		var elems = {};
		//this.setProperties(properties, name);
	 
        this._super = DisplayObject.prototype;
        
        this.resourceKey = settings.resourceKey;
        
        if (settings.width != null) {
            this.width = settings.width;
        }
        if (settings.height != null) {
            this.height = settings.height;
        }
        
        this.setResourceKey(settings.resourceKey);
        
        // call super constructor
        DisplayObject.call(this, settings);
 
        // additional public variables
        this.type = 'Sprite';
        
    }
    
    // setup the inheritance
 	Sprite.prototype = new DisplayObject();
	Sprite.prototype.constructor = Sprite;
    
	        
	Sprite.prototype.setProperties = function(nProps, name) {
		if (nProps !== undefined) {
			
			//DisplayObject.call(this, nProps, name);
			
			//DisplayObject.prototype.setProperties.call(this, nProps, name);
			
			
		}
	}
	
	/**
	 * Returns the image of this sprite 
	 */
	Sprite.prototype.getImage = function() {
		return this.image;
	}
	
	
	/**
	 * Creates the Dom node of this Element
	 */
	Sprite.prototype.createDomNode = function() {
	    
		DisplayObject.prototype.createDomNode.call(this); // Super Call
		if (this.image !== undefined) {
            this.setVisible(false);
            if (this.width != null && this.image != null) {
                this.image.width = this.width;
            }
            if (this.height != null && this.image != null) {
                this.setHeight(this.height);
            }
		    this.domNode.appendChild(this.image);
		}
		
	}
	
	/**
	 * Returns the Dom representation of this element and creates it if not existent
	 */
	Sprite.prototype.getDomNode = function() {
	    
		if(this.domNode === undefined) {
			this.createDomNode();
		}
		return this.domNode;
	}
 		
	
	Sprite.prototype.toJSON = function() {
		var str = DisplayObject.prototype.toJSON.call(this);
		
        if (this.image !== undefined) {
            str["resourceKey"] = ResourceManager.getResourceKey(this.image.src);
        }
        str["width"] = this.getWidth();
        str["height"] = this.getHeight();
        
		return str;
	}
	
	
	Sprite.prototype.getWidth = function() {
	    return (this.image !== undefined && this.image.width !== undefined && this.image.width !== 0) ? this.image.width : this.width;
	}
	
    Sprite.prototype.getHeight = function() {
        return (this.image !== undefined && this.image.height !== undefined && this.image.height !== 0) ? this.image.height : this.height;
    }
    
    Sprite.prototype.setHeight = function(height) {
        DisplayObject.prototype.setHeight.call(this, height);
        if (this.image !== undefined && this.image.height !== undefined) {
            this.image.height = height;
        }
    }
    Sprite.prototype.setWidth = function(width) {
        DisplayObject.prototype.setWidth.call(this, width);
        if (this.image !== undefined && this.image.width !== undefined) {
            this.image.width = width;
        }
    }
	
	Sprite.prototype.getX = function() {
		return this.x;
	}
	
	Sprite.prototype.getY = function() {
		return this.y;
	}
 
    Sprite.prototype.getResourceKey = function() {
        return this.resourceKey;
    }
    /**
     * Sets the resource key to load the image 
     * @param {String} key Resource Key
     */
    Sprite.prototype.setResourceKey = function(key) {
        this.resourceKey = key;
        var onLoad = (function(scope) {
            return (function() {
                    scope.width = this.width;
                    scope.height = this.height;
                    scope.updateDom();
                    scope.updateChildren();
                    
                    scope.setVisible(true);
               });
        }).call(this, this);
        this.setVisible(false);
        var newImage = ResourceManager.getResource(key, onLoad);
        if (newImage !== undefined) {
            if (this.domNode !== undefined && this.domNode.contains(this.image)) {
                // If there is already an image in this sprite remove it before adding this
                this.domNode.removeChild(this.image);
            }
            this.image = newImage;
            if (this.domNode !== undefined) {
                this.domNode.appendChild(this.image);
                this.updateDom();
            }
            
            this.image.onmousedown = function (event) {
                if (event.preventDefault) {
                     event.preventDefault(); // Prevent image dragging
                }
            }
        }
        
    }
 
 
    // return constructor
    return Sprite;
});