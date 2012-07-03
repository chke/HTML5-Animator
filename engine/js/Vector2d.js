define(function() {
    
    var DEG_TO_RAD = Math.PI/180; //ca. 0.017453292519943;
    var RAD_TO_DEG = 180/Math.PI; //ca. 57.2957795;
    
    
    // constructor
    function Vector2d(x, y) {
        this.x = x;
        this.y = y;
    }
    
    Vector2d.prototype.rotate = function(angle) {
        var newX = (this.x * Math.cos(angle * DEG_TO_RAD) - this.y * Math.sin(angle * DEG_TO_RAD));
        var newY = (this.x * Math.sin(angle * DEG_TO_RAD) + this.y * Math.cos(angle * DEG_TO_RAD));
        this.x = newX;
        this.y = newY;
    }
    
    Vector2d.prototype.scale = function(scaleX, scaleY) {
        this.x = scaleX * this.x;
        this.y = scaleY * this.y;
    }
    
    Vector2d.prototype.add = function(x, y) {
        this.x = this.x + parseFloat(x);
        this.y = this.y + parseFloat(y); 
    }
    
    /**
     * Calculates the dot product of this and the given vector(x2,y2) and returns the angel between the two vectors
     * @param {Object} x
     * @param {Object} y
     */
    Vector2d.prototype.dotProduct = function(x2, y2) {
        /*
         *         a * b
         * acos( -------- ) = angle
         *       |a| * |b|
         */
        return RAD_TO_DEG * Math.acos((this.x * x2 + this.y * y2) / (Math.sqrt(this.x * this.x + this.y * this.y) * Math.sqrt(x2 * x2 + y2 * y2)));
    }
    
    /**
     * Returns true if the angle between the two vectors is positive, else false 
     * @param {Number} x2
     * @param {Number} y2
     */
    Vector2d.prototype.isAnglePositive = function(x2, y2) {
        return (this.x * y2 - this.y * x2) > 0;
    }
    
	Vector2d.prototype.setX = function(x) {
		this.x = x;
	}
	
	Vector2d.prototype.setY = function(y) {
		this.y = y;
	}
	
	Vector2d.prototype.getX = function() {
		return this.x;
	}
	
	Vector2d.prototype.getY = function() {
		return this.y;
	}
	
    // return constructor
    return Vector2d;
});