require.config( {
    paths: {
        engine: "engine/js"
    }
});

require( ['engine/Core', 'engine/AnimEn', 'engine/Sprite', 'engine/util/CubicBezier', "engine/util/FPSCounter"], function( Core, AnimEn, Sprite, CubicBezier, FPSCounter) {
    Core.init(document.getElementById("engine"), "dom", Core);
    var test = new Sprite({x:20, y:20, resourceKey:"rect"});
    var test2 = new Sprite({x:20, y:20, resourceKey:"rect2"});
    test.addChild(test2);
    //AnimEn.getInst().getStage().addChild(test);
    //AnimEn.getInst().initAnimation();
    AnimEn.getInst().play("infinite");
    
    if (AnimEn.getInst().getAnimationMode() == "dom") {
	    var fpsCounter = new FPSCounter(FPSCounter.COUNT_TYPE_CSS);
		document.getElementsByTagName("body")[0].insertBefore(fpsCounter.getDomNode(), document.getElementsByTagName("body")[0].firstChild);
	} else {
		AnimEn.getInst().fpsCounter = new FPSCounter(FPSCounter.COUNT_TYPE_TICK);
		document.getElementsByTagName("body")[0].insertBefore(AnimEn.getInst().fpsCounter.getDomNode(), document.getElementsByTagName("body")[0].firstChild);
	}
});