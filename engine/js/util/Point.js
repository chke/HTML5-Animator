define([], function() {
 
    // constructor
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    
    
	Point.prototype.setX = function(x) {
		this.x = x;
	}
	
	Point.prototype.setY = function(y) {
		this.y = y;
	}
	
	Point.prototype.getX = function() {
		return this.x;
	}
	
	Point.prototype.getY = function() {
		return this.y;
	}
	
    // return constructor
    return Point;
});