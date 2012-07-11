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
        this.animationList = [];
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
    
    AnimObject.prototype.addAnimation = function(displObj, animName, animTime) {
    	this.animationList.push({displObj: displObj, animName: animName, animTime:animTime});
    }
    
    AnimObject.prototype.play = function() {
    	for (var i=0; i < this.animationList.length; i++) {
    		var displObj = this.animationList[i].displObj;
    		var animName = this.animationList[i].animName;
    		var animTime = this.animationList[i].animTime;
    		displObj.domNode.style.MozAnimation = animName + " " + animTime + "s linear infinite";
	        displObj.domNode.style.WebkitAnimation = animName + " " + animTime + "s linear infinite";
	        displObj.domNode.style.Animation = animName + " " + animTime + "s linear infinite";
    	}
    	
    }
    
    AnimObject.prototype.stop = function() {
    	for (var i=0; i < this.animationList.length; i++) {
    		var displObj = this.animationList[i].displObj;
    		displObj.domNode.style.MozAnimation = "";
	        displObj.domNode.style.WebkitAnimation = "";
	        displObj.domNode.style.Animation = "";
    	}
    	
    }
 
    // return constructor
    return AnimObject;
});