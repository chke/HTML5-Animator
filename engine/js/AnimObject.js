define(['engine/DisplayObject'], function(DisplayObject) {
 
    // constructor
    function AnimObject(settings) {
 
        // call super constructor
        DisplayObject.call(this, settings);
 
        // additional public variables
        this.type = 'AnimObject';
 		this._super = DisplayObject.prototype;
 		
        this.animations = {};
        if (settings.animations != null) {
            this.animations = settings.animations;
        }
        this.animationList = [];
        this.currentFrame = 0;
        
        this.objectsToAnimate = {};
        this.previousKeyframes = {};
        this.nextKeyframes = {};
        this.diffBetweenKeyframes = {};
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
    
    AnimObject.prototype.addAnimation = function(displObj, animName, animTime, scene) {
    	if (this.animationList == null) {
    		this.animationList = [];
    	}
    	this.animationList.push({displObj: displObj, animName: animName, animTime:animTime});
    }
    
    AnimObject.prototype.play = function(duration) {
    	this.isPlaying = true;
    	this.duration = duration;
    	
    	if (duration == null) {
    		duration = "";
    	}
    	if (displObj != null) {
	    	displObj.domNode.style.MozAnimation = "";
	    	displObj.domNode.style.WebkitAnimation = "";
	    	displObj.domNode.style.Animation = "";
    	}
    	for (var i=0; i < this.animationList.length; i++) {
    		var displObj = this.animationList[i].displObj;
    		var animName = this.animationList[i].animName;
    		var animTime = this.animationList[i].animTime;
    		displObj.domNode.style.MozAnimation = animName + " " + animTime + "s linear " + duration;
	        displObj.domNode.style.WebkitAnimation = animName + " " + animTime + "s linear " + duration;
	        displObj.domNode.style.Animation = animName + " " + animTime + "s linear " + duration;
    	}
		if (displObj == null) {
    		this.objectsToAnimate = {};
    		this.currentFrame = 0;
    		for (var key in this.animations.tween) {
    			this.objectsToAnimate[key] = DisplayObject.getElementById(key);
    		}
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
 
 	AnimObject.prototype.findNextKeyframe = function(animParams, start, lastKf) {
 		for (var i = start; i <= lastKf; i++) {
 			if (animParams[i] != null) {
 				return i;
 			}
 		}
 	}
 	
 	AnimObject.prototype.calculateInbetween = function(animParams, key, currentFrame) {
 		var params = {};
 		var diff = this.nextKeyframes[key] - this.previousKeyframes[key];
 		for (var paramKey in animParams) {
 			var param = animParams[paramKey] + (this.diffBetweenKeyframes[key][paramKey] * (currentFrame - this.previousKeyframes[key]) / diff);
 			
 			if (param != null && param+""!="NaN") {
 				params[paramKey] = param;
 			}
 		}
 		
 		return params;
 	}
 
	AnimObject.prototype.updateAnimations = function() {
		var lastKf = require('engine/AnimEn').getInst().findLastKeyframe();
    	if (this.isPlaying) {
    		this.currentFrame++;
    		if (this.currentFrame + 1 == lastKf) {
    			this.currentFrame = 1;
    		}
    		for (var key in this.objectsToAnimate) {
    			var obj = this.objectsToAnimate[key];
    			var animParams = this.animations.tween[key];
    			
    			if (this.previousKeyframes[key] == null || this.currentFrame == 1 || this.nextKeyframes[key] == this.currentFrame ) {
    				// When keyframe found
    				if (this.currentFrame == 1 || this.previousKeyframes[key] == null) {
    					this.nextKeyframes[key] = this.findNextKeyframe(animParams, this.currentFrame, lastKf);
    				}
	    			var keyFramePos = this.findNextKeyframe(animParams, this.currentFrame + 1, lastKf);
	    			this.previousKeyframes[key] = this.nextKeyframes[key];
	    			this.nextKeyframes[key] = keyFramePos;
    				obj.setAnimParams(animParams[this.previousKeyframes[key]]);
    				this.diffBetweenKeyframes[key] = {};
    				for (var paramKey in animParams[this.previousKeyframes[key]]) {
    					var param = animParams[this.nextKeyframes[key]][paramKey] - animParams[this.previousKeyframes[key]][paramKey];
    					if (param != null && param+""!="NaN") {
    						this.diffBetweenKeyframes[key][paramKey] = param;
    					}
    					
    				}
    				if (key == 15) {
						console.log(this.diffBetweenKeyframes[key]);
					}
    			} else if (this.currentFrame < this.nextKeyframes[key]) {
    				var newParams = this.calculateInbetween(animParams[this.previousKeyframes[key]], key, this.currentFrame);
    				if (newParams != null) {
    					obj.setAnimParams(newParams);
    				}
    			}
    		}
    	}
    	//this.duration
	}
		
    // return constructor
    return AnimObject;
});