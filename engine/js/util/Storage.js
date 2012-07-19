define(function() {

	function Storage() {
		
	}
	
	Storage.supportsLocalStorage = function() {
		return ('localStorage' in window && window['localStorage'] !== null);
	};
	
	Storage.get = function(key) {
		if (Storage.supportsLocalStorage()) {
			return JSON.parse(localStorage.getItem(key));
		} else {
			return null;
		}
	};
	
	Storage.getString = function(key) {
		if (Storage.supportsLocalStorage()) {
			return localStorage.getItem(key);
		} else {
			return null;
		}
	}
	
	Storage.set = function(key, value) {
		if (Storage.supportsLocalStorage()) {
            localStorage.setItem(key, JSON.stringify(value));
		}
    }
    
	Storage.setString = function(key, value) {
		if (Storage.supportsLocalStorage()) {
            localStorage.setItem(key, value);
		}
    }
    
	return Storage;
});
