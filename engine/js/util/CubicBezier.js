define(function() {

	function CubicBezier(xKA, yKA, xKE, yKE) {
		this.xA = 0;
		this.yA = 0;
		this.xE = 1;
		this.yE = 1;

		this.xKA = xKA;
		this.yKA = yKA;
		this.xKE = xKE;
		this.yKE = yKE;

		
	}
	
	CubicBezier.keyframeTypes = {
		linear : {
			points : [0, 0, 1, 1]
		},
		ease : {
			points : [0.25, 0.1, 0.25, 1]
		},
		easeInOut : {
			points : [0.42, 0, 0.58, 1]
		},
		easeIn : {
			points : [0.42, 0, 1, 1]
		},
		easeOut : {
			points : [0, 0, 0.58, 1]
		}
	};

	CubicBezier.prototype.bezier1 = function(kA, kE) {
		return 1.0 - 3.0 * kE + 3.0 * kA;
	}
	CubicBezier.prototype.bezier2 = function(kA, kE) {
		return 3.0 * kE - 6.0 * kA;
	}
	CubicBezier.prototype.bezier3 = function(kA) {
		return 3.0 * kA;
	}
	/**
	 * Returns the value of the bezier curve for the input that is given.
	 * If kA and kE are x values it returns the x value  else y.
	 * @param {Object} percent
	 * @param {Object} kA x or y value of the first control point
	 * @param {Object} kE x or y value of the second control point
	 */
	CubicBezier.prototype.getBezier = function(percent, kA, kE) {
		return ((this.bezier1(kA, kE) * percent + this.bezier2(kA, kE)) * percent + this.bezier3(kA)) * percent;
	}

	CubicBezier.prototype.getSlope = function(percent, kA, kE) {
		return 3 * this.bezier1(kA, kE) * percent * percent + 2 * this.bezier2(kA, kE) * percent + this.bezier3(kA);
	}

	CubicBezier.prototype.getTForX = function(x) {
		var aGuessT = x;
		//console.log("aGuessT: " + aGuessT);
		for (var i = 0; i < 8; ++i) {
			var currentSlope = this.getSlope(aGuessT, this.xKA, this.xKE);
			if (currentSlope == 0.0) {
				return aGuessT;
			}
			var currentX = this.getBezier(aGuessT, this.xKA, this.xKE) - x;
			aGuessT -= currentX / currentSlope;
			//console.log("aGuessT: " + aGuessT);
		}
		return aGuessT;
	}

	CubicBezier.prototype.getY = function(x) {
		return this.getBezier(this.getTForX(x), this.yKA, this.yKE);
	}

	CubicBezier.readTimingFunc = function(timingFunc) {
		var timingKey = null;
		var values = null;
		if (timingFunc.indexOf("ease") >= 0) {
			timingKey = "ease";
			if (timingFunc.indexOf("in") >= 0) {
				timingKey += "In";
			}
			if (timingFunc.indexOf("out") >= 0) {
				timingKey += "Out";
			}
		} else if (timingFunc.indexOf("linear") >= 0) {
			timingKey = "linear";
		} else if (timingFunc.indexOf("cubic-bezier") >= 0) {
			timingKey = "custom";
			// extract the inner of i.e. cubic-bezier(0, 1, 0, 1) and split it into an array of [0,1,0,1]
			var values = timingFunc.slice(timingFunc.indexOf("(") + 1, timingFunc.indexOf(")")).split(",");
		}
		
		if (timingKey != null && timingKey != "custom") {
			var points = CubicBezier.keyframeTypes[timingKey].points;
			return new CubicBezier(points[0], points[1], points[2], points[3]);
		} else {
			return new CubicBezier(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3]));
		}

	}

	return CubicBezier;
});
