define(function() {

	function Compatibility() {

	}

	Compatibility.vendorPrefix;

	Compatibility.requestAnimFrame = function(callback) {
		if (!window.requestAnimationFrame) {
			Compatibility.getVendorPrefix();
			window.requestAnimationFrame = window[Compatibility.vendorPrefix + 'RequestAnimationFrame'];
			if (!window.requestAnimationFrame) {
				window.requestAnimationFrame = function(callback, element) {
					var currTime = new Date().getTime();
					var timeToCall = Math.max(0, 16 - (currTime - lastTime));
					var id = window.setTimeout(function() {
						callback(currTime + timeToCall);
					}, timeToCall);
					lastTime = currTime + timeToCall;
					return id;
				};
			}
		}
		window.requestAnimationFrame(callback);
	}

	Compatibility.cancelAnimFrame = function(id) {
		if (!window.cancelAnimationFrame) {
			Compatibility.getVendorPrefix();
			window.cancelAnimationFrame = window[Compatibility.vendorPrefix + 'CancelAnimationFrame']
			if (!window.cancelAnimationFrame) {
				window.cancelAnimationFrame = function(id) {
					clearTimeout(id);
				};
			}
		}
		window.cancelAnimationFrame(id);
	}
	
	/**
	 * Better setTimeout Function with use of requestAnimFrame 
	 */
	Compatibility.setTimeout = function(callback, timeout) {
	    setTimeout(function() {
	        Compatibility.requestAnimFrame(callback);
	    }, timeout);
	}
	
	/**
	 * Returns the vendor prefix of the current browser 
	 */
	Compatibility.getVendorPrefix = function() {
		if (Compatibility.vendorPrefix == null) {
			var div = document.createElement("div");
			// Uses the transformation to get the prefix of that
			var transform = "Transform";
			var prefixes = ["Webkit", "Moz", "ms", "O", "Khtml", ""];
			var prefix;
			
			for (var i = 0; i < prefixes.length; i++) {
				prefix = prefixes[i];

				if ((prefix + transform) in div.style) {
					break;
				}
			}

			Compatibility.vendorPrefix = prefix.toLowerCase();
		}

		return Compatibility.vendorPrefix;
	}

	return Compatibility;
});
