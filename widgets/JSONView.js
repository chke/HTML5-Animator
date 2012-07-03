

require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "dojo/_base/json"],
        function(declare, _Widget, _Templated, script, domConstruct) {
     
	return declare("widgets.JSONView", [_Widget, _Templated], {
        jsonStr: "fdgd",
        templateString: "<div><textarea id='jsonEditor' style='height: 98%; width: 100%;'>${jsonStr}</textarea></div>",
        
		postCreate: function() {
			var that = this;
			dojo.subscribe("/animwidget/update", this, "onUpdate");
			
			
		},
		onUpdate: function(object) {
	        if(object !== undefined) {
	            var obj = object.toJSON();
	            //if (obj.children !== undefined) {
	            //    obj = obj.children;
	            //}
	            
	            //jsonStr = dojo.toJson(obj, true);
	            jsonStr = JSON.stringify(obj, null, 2);
	            dojo.query('#jsonEditor')[0].value = jsonStr;
	            
	            localStorage.setItem("animation", jsonStr);
	            var blub;
	        }
	    }
    });
     
});


