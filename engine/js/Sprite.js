define(['engine/DisplayObject', "engine/ResourceManager", "engine/EventListener"], function(DisplayObject, ResourceManager, EventListener) {
 
    // constructor
    function Sprite(settings) {
        var animObjs = {};
		var elems = {};
		//this.setProperties(properties, name);
	 
        this._super = DisplayObject.prototype;
        if (settings != null) {
	        this.resourceKey = settings.resourceKey;
	        
	        if (settings.width != null) {
	            this.width = settings.width;
	        }
	        if (settings.height != null) {
	            this.height = settings.height;
	        }
	        
	        if (settings.resourceKey != null) {
	        	this.setResourceKey(settings.resourceKey);
        	} else {
        		this.image = settings.image;
        		this.onResourceLoaded(this).call(this.image);
        	}
	        
	        // call super constructor
	        DisplayObject.call(this, settings);
	 
	        // additional public variables
	        this.type = 'Sprite';
        }
    }
    
    // setup the inheritance
 	Sprite.prototype = new DisplayObject();
	Sprite.prototype.constructor = Sprite;
    
	
	Sprite.prototype.addEventListener = function(eventStr, func) {
		if (this.image != null && this.domNode != null) {
	    	if (this.image.addEventListener) {
	            this.image.addEventListener(eventStr, func, false);
	        } else if (this.image.attachEvent) {
	            this.image.attachEvent('on' + eventStr, func);
	        }
        } else {
        	var event = new EventListener(this, eventStr, func);
        }
	}
	        
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
	 * Sets image of this sprite to the given one
	 */
	Sprite.prototype.setImage = function(image) {
		this.image = image;
	}
	
	
	/**
	 * Creates the Dom node of this Element
	 */
	Sprite.prototype.createDomNode = function() {
	    
		DisplayObject.prototype.createDomNode.call(this); // Super Call
		if (this.image !== undefined) {
            this.setVisible(false);
            
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
	    return this.width;
	}
	
    Sprite.prototype.getHeight = function() {
        return this.height;
    }
    
    Sprite.prototype.setHeight = function(height) {
        DisplayObject.prototype.setHeight.call(this, height);
        if (this.image !== undefined && this.image.height !== undefined) {
            //this.image.height = height;
        }
    }
    Sprite.prototype.setWidth = function(width) {
        DisplayObject.prototype.setWidth.call(this, width);
        if (this.image !== undefined && this.image.width !== undefined) {
            //this.image.width = width;
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
     * This method should be called when the Resource is loaded
     * @param scope The scope is the current scope the mehtod is called wiht (should bei this/actual scope)
     * @returns {Function}
     */
    Sprite.prototype.onResourceLoaded = function(scope) {
        return (function() {
                scope.width = (scope.width != null) ? scope.width : this.width;
                scope.height = (scope.height != null) ? scope.height : this.height;
                //this.width = orgWidth;
                //this.height = orgHeight;
                scope.updateDom();
                scope.updateChildren();
                
                scope.setVisible(true);
           });
    };
    
    /**
     * Sets the resource key to load the image 
     * @param {String} key Resource Key
     */
    Sprite.prototype.setResourceKey = function(key) {
        this.resourceKey = key;
        var orgWidth = this.width;
        var orgHeight = this.height;
        var onLoad = this.onResourceLoaded.call(this, this);
        this.setVisible(false);
        var newImage = ResourceManager.getResource(key, onLoad);
        if (newImage !== undefined) {
        	this.width = orgWidth;
        	this.height = orgHeight;
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
    /**
     * Draws this sprite to the stage 
	 * @param {Object} ctx
     */
    Sprite.prototype.draw = function(ctx) {
    	this.doTransforms(ctx);
    	ctx.save();
    	ctx.translate(-this.getWidth() * this.getRefX(), -this.getHeight() * this.getRefY());
    	ctx.drawImage(this.image,0,0, this.width, this.height);
    	ctx.restore();
    	this.undoTransforms(ctx);
    }
    Sprite.prototype.drawRecursive = function(ctx) {
    	ctx.save();
    	this.doTransforms(ctx);
    	if (this.visible) {
    		ctx.globalAlpha = this.opacity;
    		ctx.save();
    		if (this.getWidth() > 0 && this.getHeight() > 0 && this.image != null) {
	    		ctx.translate(-this.getWidth() * this.getRefX(), -this.getHeight() * this.getRefY());
	    		ctx.drawImage(this.image,0,0, this.getWidth(), this.getHeight());
	    	}
    		ctx.restore();
    		ctx.globalAlpha = 1;
    	}
    	for (var index in this.childList) {
    		this.childList[index].drawRecursive(ctx);
    	}
    	ctx.restore();
    }
 
    // return constructor
    return Sprite;
});