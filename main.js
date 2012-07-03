require.config( {
    paths: {
        engine: "engine/js"
    }
});

require( ['engine/Core', 'engine/AnimEn', 'engine/Sprite'], function( Core, AnimEn, Sprite ) {
    Core.init(document.getElementById("engine"), "dom", Core);
    var test = new Sprite({x:20, y:20, resourceKey:"rect"});
    var test2 = new Sprite({x:20, y:20, resourceKey:"rect2"});
    test.addChild(test2);
    //AnimEn.getInst().getStage().addChild(test);
    AnimEn.getInst().initAnimation();
});