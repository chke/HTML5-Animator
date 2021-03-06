define(["engine/util/Storage"], function(Storage) {

    function ResourceManager() {

    }

    var resources = {};
    var numOfResources = 0;
    var loadedResources = 0;
    var allResourcesLoadedFunc;

    ResourceManager.addResource = function(key, value) {
        var img = new Image();
        if (value.indexOf("http") === 0) {
            img.src = value;
        } else {
            img.src = value;
        }
        img.addEventListener("load", ResourceManager.onResourceLoaded, false);
        resources[key] = img;
        numOfResources++;
    };
    
    ResourceManager.onResourceLoaded = function() {
    	loadedResources++;
    	if (loadedResources == numOfResources && allResourcesLoadedFunc != null) {
    		allResourcesLoadedFunc.call();
    	}
    };
    
    ResourceManager.setOnResourceLoadedFunc = function(func) {
    	allResourcesLoadedFunc = func;
    	
    };

    ResourceManager.addLocalResource = function(key, value) {
        ResourceManager.addResource(key, value);
        var localResources = JSON.parse(localStorage.getItem("resources"));
        if (localResources == null) {
            localResources = {};
        }
        localResources[key] = value;
        Storage.set("resources", localResources);
    };
    /**
     * Returns the resource by the given key
     */
    ResourceManager.getResource = function(key, onLoaded) {
        if (resources[key] !== undefined) {
            var img = new Image();
            if (onLoaded !== undefined) {
                img.addEventListener("load", onLoaded, false);
            }
            img.src = resources[key].src;
            return img;
        } else {
            return undefined;
        }

    };
    /**
     * Returns the resource key by the given src name
     */
    ResourceManager.getResourceKey = function(src) {
        for (var key in resources) {
            if (src === resources[key].src) {
                return key;
            }
        }

        return undefined;
    };
    /**
     * Removes the resource with the given key
     */
    ResourceManager.removeResource = function(key) {
        delete resources[key];
    };

    ResourceManager.removeLocalResource = function(key) {
        ResourceManager.removeResource(key);
        var localResources = Storage.get("resources");
        if (localResources != null) {
        	delete localResources[key];
        	Storage.set("resources", localResources);
        }
    };

    ResourceManager.getResourceDict = function() {
        return resources;
    };

    ResourceManager.initLocalResources = function() {
        if ('localStorage' in window && window['localStorage'] !== null && localStorage.getItem("resources") !== null) {
            var localResources = JSON.parse(localStorage.getItem("resources"));
            for (var key in localResources) {
                ResourceManager.addResource(key, localResources[key]);
            }
        }
    };

    ResourceManager.getKeyList = function() {
        var resourceKeys = [];
        for (var key in resources) {
            resourceKeys.push(key);
        }
        return resourceKeys;
    };
    
    /**
     * Returns the URL of the given resourceKey 
	 * @param {String} key
     */
    ResourceManager.getResourceUrl = function(key) {
    	if (resources[key] != null) {
    		return resources[key].src;
    	}
    	return null;
    };
    
    ResourceManager.loadAllResources = function(onLoaded) {
    	for (var key in resources) {
    		if (resources[key] == null) {
    			
    		}
    	}
    };

    return ResourceManager;
}); 