require.config( {
    paths: {
        engine: "engine/js"
    }
});

require( ['engine/Core', 'engine/AnimEn', 'engine/Sprite', 'engine/util/CubicBezier'], function( Core, AnimEn, Sprite, CubicBezier ) {
    Core.init(document.getElementById("engine"), "canvas", Core);
    var test = new Sprite({x:20, y:20, resourceKey:"rect"});
    var test2 = new Sprite({x:20, y:20, resourceKey:"rect2"});
    test.addChild(test2);
    //AnimEn.getInst().getStage().addChild(test);
    //AnimEn.getInst().initAnimation();
    AnimEn.getInst().play("infinite");
});