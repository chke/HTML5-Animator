define(["engine/AnimObject", "engine/DisplayObject", "engine/Sprite", "engine/ResourceManager"], function (AnimObject, DisplayObject, Sprite, ResourceManager) {

    function AnimEn() {
	
    	this.domNode;
    	this.canvasNode;
    	
    	this.gameLoopId;
    	this.activeScene = "defaultAnim";
    	
    	this.fps = 30;
    	
    	this.stage;
    	
    	this.selectedObject;
    	
    	this.animationMode;
    	
    	this.animObjs = [];
    	
    	this.scenes = {};
	
	}
	
    	
    AnimEn.ANIMATION_MODE_DOM = "dom";
    AnimEn.ANIMATION_MODE_CANVAS = "canvas";
    
    
	AnimEn.prototype.setDomNode = function(node) {
		this.domNode = node;
		this.initialize();
	}

	AnimEn.prototype.setCanvasNode = function(node) {
		this.canvasNode = node;
		this.initialize();
	}
	
	/**
	 * Initializes the Game Engine
	 */
	AnimEn.prototype.initialize = function() {
		
		if (this.domNode || this.canvasNode) {
			
			// Create the stage Object
			this.stage = new AnimObject({"animations": { "defaultAnim": {} }});
			this.animObjs.push(this.stage);
			
			
			if (this.getAnimationMode() === "dom") {
				this.stage.setDomNode(this.domNode);
				this.stage.addEventListener("click", function(event) {
					
					var elem = document.elementFromPoint(event.clientX, event.clientY);
					var parent = elem.parentNode;
				});
				
				this.stage.addEventListener("mousedown", function(event) {
					var elem = document.elementFromPoint(event.clientX, event.clientY);
					AnimEn.getInst().setSelectedObject(AnimEn.getInst().getObjectFromDom(elem));
				});
				
				
				this.stage.addEventListener("mousemove", function(event) {
				});
			}
			
			if (this.gameLoopId != undefined) {
				this.clearInterval(gameLoopId);
			}
			
			
			gameLoopId = setTimeout(this.animationLoop, 1000 / this.fps);
		}
	}
	
	/**
	 * Creates an Element with the given properties
	 */
	AnimEn.prototype.createElement = function(properties, name, parent) {
		
		var currObj;
		
		if (properties.resourceKey !== undefined) {	// Sprite
			currObj = new Sprite(properties);
		} else if (properties.children !== undefined) { // AnimObject
			currObj = new AnimObject(properties);
			this.animObjs.push(currObj);
		} else { // Display Object
			currObj = new DisplayObject(properties);
		}
		if (currObj.getName() === undefined || currObj.getName() === "") {
		    currObj.setName(name);
		}
		if (parent != undefined) {
		    parent.addChild(currObj);
		}
		if(properties.children !== undefined && properties.children !== null) {
			for(var key in properties.children) {
				var currChild = properties.children[key];
				if (properties.children[key].resourceKey !== undefined) {
					//var s = require("Sprite");
					var sprite = this.createElement(properties.children[key], key, currObj);
					
					//new Sprite(settings.children[i], key);
					currObj.children[key] = sprite;
				} else if (properties.children[key].children !== undefined) {
					//var a = require("AnimObject");
					var animObj = this.createElement(properties.children[key], key, currObj);
					//var animObj = new AnimObject(settings.children[i], key);
					currObj.children[key] = animObj;
				} else {
					var displObj = this.createElement(properties.children[key], key, currObj);
					currObj.children[key] = animObj;
				}
			}
		}
		return currObj;
		
	}
	/**
	 * Returns all scenes of this animation 
	 */
	AnimEn.prototype.getAllScenes = function() {
		var scenes = {};
		for(var key in this.animObjs) {
            for (var scene in this.animObjs[key].getAnimations()) {
            	scenes[scene] = true;
            }
        }
        return scenes;
	}
	
	AnimEn.prototype.initAnimation = function() {
	    var lastKeyframe = this.findLastKeyframe() - 1;
	    // Set the current vendor Prefix
	    var prefix = "-" + this.getVendorPrefix().toLowerCase() + "-";
	    //var keyframeprefix = "-webkit-keyframes";//-webkit-keyframes
	    var animTime = lastKeyframe / this.fps;
	    
	    this.scenes = this.getAllScenes();
	    this.activeScene = localStorage.getItem("activeScene");
	    // check if the active scene is valid
	    if (this.activeScene == null || this.scenes[this.activeScene] == null) {
	    	this.activeScene = "defaultAnimation";
	    }
	    
	    for (var key in this.stage["animations"][this.activeScene]["init"]) {
    		this.stage.getElementById(key).setAnimParams(this.stage["animations"][this.activeScene]["init"][key]);
    	}
	    
	    for(var key in this.animObjs) {
            var scene = this.animObjs[key].getAnimations()[this.activeScene]["tween"];
            for(var keyObj in scene) {
                var displayObj = this.animObjs[key].findById(parseInt(keyObj));
                var obj = scene[keyObj];
                var animName = "Animation" + keyObj;
                var keyframes = '@' + prefix + "keyframes " + animName + ' { ';
                
                for(var keyKeyframe in obj) {
                    
                    var kfPercent = Math.floor((parseInt(keyKeyframe) - 1) / lastKeyframe * 100);
                    keyframes += this.createKeyframe(animName, obj[keyKeyframe], kfPercent, prefix, displayObj);
                    
	                
	            }
	            
	            keyframes += '} ';
	            
	            //keyframes = "@-moz-keyframes Animation1 { 1% { -moz-transform:rotate( 0deg ) ; left:0px; top:0px; } 100% { -moz-transform:rotate( 0deg ) ; left:0px; top:0px; } 50% { -moz-transform:rotate( 12deg ) ; left:0px; top:0px; } }";
	            //keyframes = "@-moz-keyframes Animation17 { 0% { -moz-transform:rotate( 0deg ) ; -moz-animation-timing-function: cubic-bezier(0, 1, 0, 1); left:-4px; top:3px; } 100% { -moz-transform:rotate( 0deg ) ; -moz-animation-timing-function: cubic-bezier(0, 0, 0, 0); left:0px; top:5px; } 49% { -moz-animation-timing-function: ease-in; -moz-transform:rotate( 0deg ) ; left:556px; top:0px; } }";
	            
	            
                if(document.styleSheets && document.styleSheets.length) {
                    document.styleSheets[0].insertRule(keyframes, 0);
                } else {
                    var s = document.createElement('style');
                    s.innerHTML = keyframes;
                    document.getElementsByTagName( 'head' )[0].appendChild(s);
        
                }
                this.animObjs[key].addAnimation(displayObj, animName, animTime);
                console.log(keyframes);
                
                
                /*displayObj.domNode.style.MozAnimation = animName + " " + animTime + "s linear infinite";
                displayObj.domNode.style.WebkitAnimation = animName + " " + animTime + "s linear infinite";
                displayObj.domNode.style.Animation = animName + " " + animTime + "s linear infinite";
                console.log(keyframes);*/
            }
            this.animObjs[key].play();
            //this.animObjs[key].stop();
	    }
	    
	}
	
    AnimEn.prototype.getVendorPrefix = function() {
        var regex = /^(Moz|Webkit|Khtml|O|ms)(?=[A-Z])/;

        var loadedScript = document.getElementsByTagName('script')[0];

        for(var prop in loadedScript.style) {
            if(regex.test(prop)) {
                // regexp.text is faster than .match so only match if it is a correct property
                return prop.match(regex)[0];
            }

        }

        // If nothing has been found the script is searched for some tags in it to get the right vendor prefix
        if('WebkitOpacity' in loadedScript.style)
            return 'Webkit';
        if('KhtmlOpacity' in loadedScript.style)
            return 'Khtml';

        return '';
    }

	/**
	 * Create hte keyframes for a specific animation
	 */
	AnimEn.prototype.createKeyframe = function(animName, animation, kfPercent, prefix, displayObj) {
	    // Create Keyframes and insert them to the stylesheet
	    var animString = "" + kfPercent + "% { ";
	    animString += prefix + "transform:";
	    
	    if (animation.rotation !== undefined) {
            animString += "rotate( " + (animation.rotation | 0) + "deg ) ";
        }
        animString += "; ";
        if (animation.x !== undefined) {
            animString += "left:" + (animation.x - displayObj.getRefPosX() + ((displayObj.getParent() != null) ? displayObj.getParent().getRefPosX() : 0)) + "px; ";
        }
        if (animation.y !== undefined) {
            animString += "top:" + (animation.y - displayObj.getRefPosY() + ((displayObj.getParent() != null) ? displayObj.getParent().getRefPosY() : 0)) + "px; ";
        }
        if (animation.timingFunc !== undefined) {
        	animString += prefix + "animation-timing-function: " + animation.timingFunc + " ";
        }
        animString += "} ";
        return animString;
        

	    
	}
	
	/**
	 * returns the last keyframe position to determine the length of the animation 
	 */
	AnimEn.prototype.findLastKeyframe = function() {
	    var maxKf = 0;
	    for(var key in this.animObjs) {
	        var animations = this.animObjs[key].getAnimations();
	        if (animations != null) {
                var scene = animations[this.activeScene]["tween"];
                for(var keyObj in scene) {
                    var obj = scene[keyObj];
                    for(var keyKeyframe in obj) {
                        var kfInt = parseInt(keyKeyframe);
                        if (maxKf === undefined || maxKf < kfInt) {
                            maxKf = kfInt;
                    }
                }
            }
            }
        }
        return maxKf;
	}
	
	AnimEn.prototype.animationLoop = function() {
		
	}
	
	
	/**
	 * Update objects
	 */
	AnimEn.prototype.update = function() {
	}
	
	
	AnimEn.prototype.getAnimationMode = function() {
		return "dom"; // Currently only dom
	}
	
	AnimEn.prototype.setSelectedObject = function(obj) {
		this.selectedObject = obj;
	}
	
	/**
	 * Returns the DisplayObject of the given Dom Object
	 */
	AnimEn.prototype.getObjectFromDom = function(fromDom) {
		var object = undefined;
		if (fromDom !== undefined) {
			if (fromDom.nodeName === "IMG") {
				fromDom = fromDom.parentNode;
			}
			object = DisplayObject.getElementById(fromDom.getAttribute("id").slice(2));
		}
		return object;
	}
	
	AnimEn.prototype.getStage = function() {
		return this.stage;
	}
	
	/**
	 * Initialize the enimation engine
     * @param {DOMNode} domNode Dom node of the stage
     * @param {String} animMode AnimationMode (currently only dom)
     * @param {Object} gameClass The class for the game to run (i.e. AnimEn)
	 */
    AnimEn.init = function(domNode, animMode, gameClass) {
        AnimEn.instance = new gameClass();
        AnimEn.instance.animationMode = animMode;
        if (animMode === AnimEn.ANIMATION_MODE_DOM) {
            AnimEn.instance.setDomNode(domNode);
        } else if (animMode === AnimEn.ANIMATION_MODE_CANVAS) {
            AnimEn.instance.setCanvasNode(domNode);
        }
    }
    
    AnimEn.getAnimationMode = function() {
        return AnimEn.instance.animationMode;
    }
    
    AnimEn.getStage = function() {
        return AnimEn.instance.getStage();
    }
    
    AnimEn.getInst = function() {
        return AnimEn.instance;
    }
    


    return AnimEn; // Class Instance
});