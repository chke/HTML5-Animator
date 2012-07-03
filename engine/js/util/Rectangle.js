define([], function() {
 
    // constructor
    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    
    Rectangle.prototype.setX = function(x) {
        this.x = x;
    }
    
    Rectangle.prototype.setY = function(y) {
        this.y = y;
    }
    
    Rectangle.prototype.getX = function() {
        return this.x;
    }
    
    Rectangle.prototype.getY = function() {
        return this.y;
    }
 
    
    Rectangle.prototype.setWidth = function(width) {
        this.width = width;
    }
    
    Rectangle.prototype.setHeight = function(height) {
        this.height = height;
    }
    
    Rectangle.prototype.getHeight = function() {
        return this.height;
    }
    
    Rectangle.prototype.getWidth = function() {
        return this.width;
    }
    
 
 
    // return constructor
    return Rectangle;
});