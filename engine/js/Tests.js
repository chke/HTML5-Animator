require.config( {
    paths: {
        engine: "engine/js"
    }
});

require( ['engine/Core', 'engine/AnimEn', 'engine/Sprite', 'engine/util/CubicBezier'], function( Core, AnimEn, Sprite, CubicBezier ) {
    
    var bez = new CubicBezier(0,0,1,1);
    
    console.log("linear");
    console.log(bez.getBezier(0, 0, 1));
    console.log(bez.getBezier(0.25, 0, 1));
    console.log(bez.getBezier(0.5, 0, 1));
    console.log(bez.getBezier(1, 0, 1));
    
    bez = new CubicBezier(0,1,0,1);
    
    console.log("Y: " + bez.getY(0.1));
    console.log("Y: " + bez.getY(0.2));
    console.log("Y: " + bez.getY(0.3));
    console.log("Y: " + bez.getY(0.4));
    console.log("Y: " + bez.getY(0.5));
    console.log("Y: " + bez.getY(0.6));
    console.log("Y: " + bez.getY(0.7));
    console.log("Y: " + bez.getY(0.8));
    console.log("Y: " + bez.getY(0.9));
    console.log("Y: " + bez.getY(1));
    
    
    bez = new CubicBezier(0.42,0,0.58,1);
    
    console.log("ease-in-out");
    console.log(bez.getY(0.25));
    console.log(bez.getY(0.5));
    console.log(bez.getY(0.75));
});