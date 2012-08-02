define(['engine/util/Compatibility'], function(Compatibility) {

	FPSCounter.COUNT_TYPE_CSS = 0;
	FPSCounter.COUNT_TYPE_JS = 1;
	
	function FPSCounter(countType) {
		this.countType = countType;
		
    	this.currFps = 0;
    	this.frameCount = 0;
		this.currTime = new Date();
    	this.lastTime = new Date();
    	this.diffTime;
    	this.fpsLoopId;
    	
    	
    	if (countType == FPSCounter.COUNT_TYPE_CSS) {
    		if (window.mozPaintCount != null) {
				this.countFunc = function(that) {
					return function() {
						that.cssCount();
					}
				}
				this.countFunc = this.countFunc.call(this, this);
				this.cssCount();
			} else {
				// We have to calculate the frames ourself 
				// based on http://www.kaizou.org/2011/06/effectively-measuring-browser-framerate-using-css/
				// But this is only an approximated value and must not be the real fps
				
				this.ref = document.createElement("div");
        		this.ref.setAttribute("id", "RefAnimElem");
				
				var style = "-webkit-transition: all 1s linear;";
		        style += "-moz-transition: all 1s linear;";
		        style += "-o-transition: all 1s linear;";
		        style += "position: absolute;";
		        style += "width: 1px;";
		        style += "height: 1px;";
		        style += "left: 0px;";
		        style += "bottom: 0px;";
		        style += "background-color: transparent;";
		        this.ref.setAttribute("style", style);
		        
		        var body = document.getElementsByTagName("body")[0];
		        body.appendChild(this.ref);
		        
		        // Save current scope
		        var itEndFunc = function(that) {
					return function() {
						that.iterationEnded();
					}
				}
				itEndFunc = itEndFunc.call(this, this);
		        
			    this.ref.addEventListener("webkitTransitionEnd", itEndFunc, false);
			    this.ref.addEventListener("transitionend", itEndFunc, false);
			    this.ref.addEventListener("oTransitionEnd", itEndFunc, false);
			    
			    
			    
			    this.countFunc = function(that) {
					return function() {
						that.cssSelfCount();
					}
				}
				this.countFunc = this.countFunc.call(this, this);
				this.cssSelfCount();
			    this.startIteration();
			}
    	}
	}
	
	FPSCounter.prototype.iterationEnded = function() {
		this.startIteration();
	}
	
	
	FPSCounter.prototype.startIteration = function() {
	    if (this.ref.style.left == "0px") {
	        this.direction = 1;
	        this.ref.style.left = "400px";
	    } else {
	        this.direction = -1;
	        this.ref.style.left = "0px";
	    }	
	}
	
	FPSCounter.prototype.cssSelfCount = function () {
		this.currTime = new Date();
		this.diffTime = (this.currTime.getTime() - this.lastTime.getTime());
		if (this.diffTime >= 1000) {
			this.currFps = this.frameCount;
			this.frameCount = 0;
			this.lastTime = this.currTime;
			if (this.domNode != null) {
				this.domNode.innerHTML = this.currFps + " FPS";
			}
		}
		var compStyle = window.getComputedStyle(this.ref, null);
		var value = compStyle.getPropertyCSSValue("left");
		var floatValue = value.getFloatValue(CSSPrimitiveValue.CSS_PX)
		if (this.lastValue != floatValue) {
			
			this.frameCount++;
			
			this.lastValue = floatValue;
		}
		
		
		Compatibility.setTimeout(this.countFunc, 1000/120);
		
	}
	
	FPSCounter.prototype.cssCount = function () {
		// FPS is new FrameCount - last
		this.fps = window.mozPaintCount - this.frameCount;
		if (this.domNode != null) {
			this.domNode.innerHTML = this.fps + " FPS";
		}
		
		this.frameCount = window.mozPaintCount;
		
		Compatibility.setTimeout(this.countFunc, 1000);
		
	}
	
	FPSCounter.prototype.tick = function () {
		this.currTime = new Date();
		this.diffTime = (this.currTime.getTime() - this.lastTime.getTime());
		
		if (this.diffTime >= 1000) {
			this.currFps = this.frameCount;
			this.frameCount = 0;
			this.lastTime = this.currTime;
			if (this.domNode != null) {
				this.domNode.innerHTML = this.currFps + " FPS";
			}
		}
		
		this.frameCount++;
	}
	
	FPSCounter.prototype.getDomNode = function () {
		if (this.domNode == null) {
			this.domNode = document.createElement("span");
			this.domNode.style.position = "absolute";
			this.domNode.style.zIndex = "8000";
		}
		return this.domNode;
	}
	

	return FPSCounter;
});
