define(["engine/AnimObject", "engine/DisplayObject", "engine/Sprite", "engine/ResourceManager", "engine/util/Storage", "engine/EventListener"], function (AnimObject, DisplayObject, Sprite, ResourceManager, Storage, EventListener) {

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
    	
    	this.animationNode = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(this.animationNode);
    	
    	this.scenes = {};
    	
    	this.ctx = null;
	
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
			this.stage = new AnimObject({"animations": { }});
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
			} else {
				// Canvas mode
				
				this.ctx = this.canvasNode.getContext('2d');
				this.canvasNode.width = this.canvasNode.offsetWidth;
				this.canvasNode.height = this.canvasNode.offsetHeight;
				this.stage.setHeight(this.canvasNode.height);
				this.stage.setWidth(this.canvasNode.width);
				
				this.canvasNode.addEventListener("click", function(event) {
					EventListener.handleClick(event.clientX, event.clientY);
				});
				
				
				if (this.animationLoopId != null) {
					this.clearInterval(this.animationLoopId);
				}
				var animFunc = function(that) {
					return function() {
						that.animationLoop();
					}
				}
				animFunc = animFunc.call(this, this);
				this.animationLoopId = setInterval(animFunc, 1000 / this.fps);
				
			}
			
		}
	}
	
	/**
	 * Add a scene to the engine this scene will not be loaded directly
	 * @param scneneName Name of the scene
	 * @param properties Settings of the scene 
	 */
	AnimEn.prototype.addScene = function(sceneName, properties) {
		this.scenes[sceneName] = properties;
	}
	/**
	 * Deletes a scene 
	 */
	AnimEn.prototype.deleteScene = function(sceneName) {
		delete this.scenes[sceneName];
	}
	
	/**
	 * Sets the active scene to the given one and initializes the stage and the new animations
	 * @param scene Given scene to be loaded 
	 */
	AnimEn.prototype.setActiveScene = function(scene) {
		this.activeScene = scene;
		Storage.setString("activeScene", scene);
		
		this.stage.removeAllChildren();
		this.stage.animations = {};
		
        for (var key in this.scenes[this.activeScene].children) {
            var animObj = this.createElement(this.scenes[this.activeScene].children[key]);
            this.stage.addChild(animObj);
        }
        this.stage.setAnimations(this.scenes[this.activeScene].animations);
        
		//this.stage = this.createElement(properties);
		
        this.lastKeyframe = this.findLastKeyframe();
        if (this.animationMode == AnimEn.ANIMATION_MODE_DOM) {
        	this.initCSSAnimation(false);
        } else {
        	this.initCanvasAnimation(false);
        }
        
	}
	
	
	/**
	 * Renders the canvas on the screen 
	 */
	AnimEn.prototype.animationLoop = function() {
		if (this.fpsCounter) {
			this.fpsCounter.tick();
		}
		this.updateLoop();
		this.renderLoop();
		
	}
	
	
	/**
	 * Renders the canvas on the screen 
	 */
	AnimEn.prototype.renderLoop = function() {
		
		
		this.ctx.clearRect(0,0,this.canvasNode.scrollWidth,this.canvasNode.scrollHeight);
		
		this.stage.drawRecursive(this.ctx);
		
		// for (var index in DisplayObject.elementList) {
			// var displObj = DisplayObject.elementList[index];
			// displObj.draw(ctx);
			// //ctx.drawImage(img,0,0);
		// }
	}
	
	AnimEn.prototype.updateLoop = function() {
		for (var index in this.animObjs) {
			this.animObjs[index].updateAnimations();
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
        return this.scenes;
	}
	
	
	AnimEn.prototype.initCanvasAnimation = function(playAnim) {
		var lastKeyframe = this.findLastKeyframe() - 1;
		for(var key in this.animObjs) {
        	var animParamObjs = this.animObjs[key].getAnimations()["tween"];
            for(var keyObj in animParamObjs) {
                var displayObj = this.animObjs[key].findById(parseInt(keyObj));
            }
		}
	}
	
	
	
	/**
	 * Initializes the animation of the current scene
	 * @param playAnim True when the Animation should be played afer initialisation
	 */
	AnimEn.prototype.initCSSAnimation = function(playAnim) {
	    var lastKeyframe = this.findLastKeyframe() - 1;
	    // Set the current vendor Prefix
	    var prefix = "-" + this.getVendorPrefix().toLowerCase() + "-";
	    //var keyframeprefix = "-webkit-keyframes";//-webkit-keyframes
	    var animTime = lastKeyframe / this.fps;
	    var sheet;
	    this.loadActiveScene();
	    var animation = [];
	    for(var key in this.animObjs) {
        	var animParamObjs = this.animObjs[key].getAnimations()["tween"];
        	this.animObjs[key].animationList = null;
            for(var keyObj in animParamObjs) {
                var displayObj = this.animObjs[key].findById(parseInt(keyObj));
                var animParams = animParamObjs[keyObj];
                var animName = "Animation" + keyObj;
                var keyframes = '@' + prefix + "keyframes " + animName + ' { ';
                
                for(var keyKeyframe in animParams) {
                    var kfPercent = Math.floor((parseInt(keyKeyframe) - 1) / lastKeyframe * 100);
                    keyframes += this.createKeyframe(animName, animParams[keyKeyframe], kfPercent, prefix, displayObj);
	            }
	            
	            keyframes += '} \n';
	            
	            animation.push(keyframes);
                this.animObjs[key].addAnimation(displayObj, animName, animTime);
                console.log(keyframes);
            }
			if (playAnim) {
				this.animObjs[key].play(this.activeScene);
			}
            //this.animObjs[key].stop();
	    }
	    
	    if (this.animationNode.sheet != null) {
	    	sheet = this.animationNode.sheet;
	    } else {
			sheet = document.styleSheets[document.styleSheets.length - 1]
		}
	    // Delete old anim rules
	    for (var i=sheet.cssRules.length - 1; i >= 0 ; i--) {
	    	sheet.deleteRule(i);
	    }
	    // Add animation rules
	    for (var i=0; i < animation.length; i++) {
	    	sheet.insertRule(animation[i], 0);
	    }
	}
	
	/**
	 * Play the animation of the current scene 
	 */
	AnimEn.prototype.play = function(duration) {
		if (duration == null) {
			duration = "";
		}
		for(var key in this.animObjs) {
			this.animObjs[key].play(duration);
		}
		lastKeyframe = this.findLastKeyframe();
		if (duration != "infinite") {
			var time = (1000 * lastKeyframe) / this.fps;
			var func = function(animEn) {
				return function() {
					animEn.stop();
				};
			}.call(this, this);
			this.playTimer = setTimeout(func, time);
		}
	}
	/**
	 * Stop the animation of the current scene 
	 */
	AnimEn.prototype.stop = function() {
		clearTimeout(this.playTimer);
		for(var key in this.animObjs) {
			this.animObjs[key].stop();
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
        if (animation.width !== undefined) {
            animString += "width: " + animation.width + "px; ";
        }
        if (animation.height !== undefined) {
            animString += "height: " + animation.height + "px; ";
        }
        if (animation.opacity !== undefined) {
            animString += "opacity: " + animation.opacity + "; ";
        }
        if (animation.timingFunc !== undefined) {
        	animString += prefix + "animation-timing-function: " + animation.timingFunc + " ";
        }
        animString += "} ";
        return animString;
        

	    
	}
	AnimEn.prototype.loadActiveScene = function() {
	    this.scenes = this.getAllScenes();
	    this.activeScene = Storage.getString("activeScene");
	    // check if the active scene is valid
	    if (this.activeScene == null || this.scenes[this.activeScene] == null) {
	    	this.activeScene = "defaultAnim";
	    }
	}
	/**
	 * returns the last keyframe position to determine the length of the animation 
	 */
	AnimEn.prototype.findLastKeyframe = function() {
	    var maxKf = 0;
	    this.loadActiveScene();
	    for(var key in this.animObjs) {
	        var animations = this.animObjs[key].getAnimations();
	        if (animations != null) {
                var scene = animations["tween"];
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
	
	
	/**
	 * Update objects
	 */
	AnimEn.prototype.update = function() {
	}
	
	/**
	 * Returns the active animation mode 
	 */
	AnimEn.prototype.getAnimationMode = function() {
		return this.animationMode; // dom or canvas
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
			var id = fromDom.getAttribute("id");
			if (id != null) {
				id = id.slice(2);
			}
			object = DisplayObject.getElementById(id);
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