define(['engine/DisplayObject', 'engine/Sprite', "engine/ResourceManager"], function(DisplayObject, Sprite, ResourceManager) {
 
    // constructor
    function SpriteSheet(settings) {
    	

    	this.tilesX = settings.tilesX;
    	this.tilesY = settings.tilesY;
    	
    	this.tileIndex = settings.tileIndex;
    	
        // call super constructor
        Sprite.call(this, settings);
 
        // additional public variables
        this.type = 'SpriteSheet';
        
    }
    
    // setup the inheritance
    SpriteSheet.prototype = new Sprite();
    SpriteSheet.prototype.constructor = SpriteSheet;
    
	
	/**
	 * Returns the image of this sprite 
	 */
	SpriteSheet.prototype.getImage = function() {
		return this.image;
	}
	
	SpriteSheet.prototype.clone = function(deepCopy) {
		
		var sheet = new SpriteSheet({tilesX:this.tilesX, tilesY:this.tilesY, tileIndex:this.tileIndex, image:this.image, x:this.x, y:this.y,refX:this.refX,refY:this.refY});
		
		return sheet;
		
	}
	
	SpriteSheet.prototype.onResourceLoaded = function(scope) {
		return (function() {
			scope.updateSpriteSheet(this);
       });
	};
	
	SpriteSheet.prototype.updateSpriteSheet = function(image) {
		var tileIndexX = parseInt(this.tileIndex % this.tilesX);
		var tileIndexY = parseInt(this.tileIndex / this.tilesX);
		this.width = this.width | image.width;
		this.height = this.height | image.height;
		this.tileWidth = (this.width | image.width) / this.tilesX;
		this.tileHeight = (this.height | image.height) / this.tilesY;
		this.offsetX = tileIndexX * (this.width / this.tilesX);
		this.offsetY = tileIndexY * (this.height / this.tilesY);
        //this.width = orgWidth;
        //this.height = orgHeight;
		this.updateDom();
		this.updateChildren();
        
		this.setVisible(true);
	};

	SpriteSheet.prototype.getWidth = function() {
		return this.tileWidth;
	};
	
	SpriteSheet.prototype.getHeight = function() {
		return this.tileHeight;
	};
	
    /**
     * Draws this sprite to the stage 
	 * @param {Object} ctx
     */
	SpriteSheet.prototype.draw = function(ctx) {
    	this.doTransforms(ctx);
    	ctx.save();
    	ctx.translate(-this.getWidth() * this.getRefX(), -this.getHeight() * this.getRefY());
		ctx.drawImage(this.image,this.offsetX, this.offsetY, this.width / this.tilesX, this.height / this.tilesY, 0,0, this.width / this.tilesX, this.height / this.tilesY);
    	ctx.restore();
    	this.undoTransforms(ctx);
    };
    
	SpriteSheet.prototype.drawRecursive = function(ctx) {
    	ctx.save();
    	this.doTransforms(ctx);
    	if (this.visible) {
    		ctx.globalAlpha = this.opacity;
    		ctx.save();
    		if (this.getWidth() > 0 && this.getHeight() > 0 && this.image != null) {
	    		ctx.translate(-this.getWidth() * this.getRefX(), -this.getHeight() * this.getRefY());
	    		ctx.drawImage(this.image,this.offsetX, this.offsetY, this.width / this.tilesX, this.height / this.tilesY, 0,0, this.width / this.tilesX, this.height / this.tilesY);
	    	}
    		ctx.restore();
    		ctx.globalAlpha = 1;
    	}
    	for (var index in this.childList) {
    		this.childList[index].drawRecursive(ctx);
    	}
    	ctx.restore();
    };
	
	SpriteSheet.prototype.setTileIndex = function(tileIndex) {
		this.tileIndex = tileIndex;
		this.updateSpriteSheet(this.image);
	};

	SpriteSheet.prototype.getTileIndex = function() {
		return this.tileIndex;
	};
 
    // return constructor
    return SpriteSheet;
});