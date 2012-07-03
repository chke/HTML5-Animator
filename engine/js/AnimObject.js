define(['engine/DisplayObject'], function(DisplayObject) {
 
    // constructor
    function AnimObject(settings) {
 
        // call super constructor
        DisplayObject.call(this, settings);
 
        // additional public variables
        this.type = 'AnimObject';
 		this._super = DisplayObject.prototype;
 		
        this.animations = {defaultAnim: {}};
        if (settings.animations != null) {
            this.animations = settings.animations;
        }
    }
    
    
	AnimObject.prototype = new DisplayObject();
	AnimObject.prototype.constructor = AnimObject;
 
    // setup the inheritance chain
    //AnimObject.prototype = DisplayObject.prototype;
    //AnimObject.prototype.constructor = AnimObject;
	
	/**
	 * Creates the Dom node of this Element
	 */
	AnimObject.prototype.createDomNode = function() {
		DisplayObject.prototype.createDomNode.call(this); // Super Call
		
		for (var key in this.children) {
			this.domNode.appendChild(this.children[key].getDomNode());
		}
	}
	
	/**
	 * Returns the Dom representation of this element and creates it if not existent
	 */
	AnimObject.prototype.getDomNode = function() {
		return DisplayObject.prototype.getDomNode.call(this); // Super Call
	}
	
	
	AnimObject.prototype.addChild = function(child) {
		if (this.domNode === undefined) {
			this.createDomNode();
		}
		DisplayObject.prototype.addChild.call(this, child); // Super Call
		
		
	}
	
	
    AnimObject.prototype.getAnimations = function() {
        return this.animations;
    }
    
    AnimObject.prototype.setAnimations = function(animations) {
        if (animations != null) {
            this.animations = animations;
        }
    }
	
	
	
	AnimObject.prototype.toJSON = function() {
        var str = DisplayObject.prototype.toJSON.call(this);
        str["animations"] = this.animations;
		return str;
	}
 
    AnimObject.prototype.play = function() {
        
    }
 
    // return constructor
    return AnimObject;
});