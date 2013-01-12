define(function() {
    
    // constructor
    function EventListener(displObj, event, func) {
        this.event = event;
        this.func = func;
        this.displObj = displObj;
        
        EventListener.listener.push(this);
    }
    EventListener.listener = [];
    
    EventListener.handleClick = function(x, y) {
    	for(var index in EventListener.listener) {
    		var evt = EventListener.listener[index];
    		var pos = evt.displObj.getRefStagePos();
    		if ((pos.x + evt.displObj.getWidth() * pos.scaleX * (1 - evt.displObj.getRefX())) >= x 
    				&& (pos.x - evt.displObj.getWidth() * pos.scaleX * evt.displObj.getRefX()) <= x) {
    			if ((pos.y + evt.displObj.getHeight() * pos.scaleY * (1 - evt.displObj.getRefY())) >= y 
        				&& (pos.y - evt.displObj.getHeight() * pos.scaleY * evt.displObj.getRefY()) <= y) {
    				evt.func.call();
    				return;
    			}
    		}
    	}
    };
    
    // return constructor
    return EventListener;
});