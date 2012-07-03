define(['engine/Vector2d'], function(Vector2d) {

    // constructor
    function DisplayObject(settings) {
        this.children = [];
        this.x = 0;
        this.y = 0;

        this.type = 'DisplayObject';

        if (settings !== undefined) {
            // Set the given properties
            this.children = {};
            this.name = settings.name;
            if (this.name === undefined || this.name === "") {
                // only set outer value if inner is not defined
                this.name = name;
            }
            this.x = settings.x | 0;
            this.y = settings.y | 0;
            this.z = settings.z;
            if (settings.id != null) {
                this.setId(settings.id);
                if (settings.id >= DisplayObject.elementListLength) {
                    // Update element list length
                    DisplayObject.elementListLength = settings.id + 1;
                }
                DisplayObject.elementList["do" + settings.id] = (this);
            }

            this.refX = (settings.refX == null) ? 0.5 : settings.refX;
            this.refY = (settings.refY == null) ? 0.5 : settings.refY;

            if (settings.rotation !== undefined) {
                this.rotation = settings.rotation;
            }
            if (settings.scaleX !== undefined) {
                this.scaleX = settings.scaleX;
            }
            if (settings.scaleY !== undefined) {
                this.scaleY = settings.scaleY;
            }
            if (settings.width !== undefined) {
                this.width = settings.width;
            }
            if (settings.height !== undefined) {
                this.height = settings.height;
            }
        }
    }


    DisplayObject.elementList = [];
    DisplayObject.elementListLength = 0;
    DisplayObject.prototype.setProperties = function(settings, name) {

    }
    /**
     * Updates the dom representation of this object with the current settings
     */
    DisplayObject.prototype.updateDom = function() {
        if (this.z !== undefined) {
            this.domNode.style.zIndex = this.z;
        }
        this.domNode.style.MozTransform = "";
        // Set Transform to empty
        this.domNode.style.webkitTransform = "";
        this.domNode.style.transform = "";
        if (this.rotation !== undefined && this.rotation !== 0) {
            this.domNode.style.MozTransform += "rotate(" + this.rotation + "deg)";
            this.domNode.style.webkitTransform += "rotate(" + this.rotation + "deg)";
            this.domNode.style.transform += "rotate(" + this.rotation + "deg)";
        }
        if ((this.scaleX !== undefined || this.scaleY !== undefined) && (this.scaleX !== 0 || this.scaleY !== 0)) {
            this.domNode.style.MozTransform += "scale(" + this.getScaleX() + ", " + this.getScaleY() + ")";
            this.domNode.style.webkitTransform += "scale(" + this.getScaleX() + ", " + this.getScaleY() + ")";
            this.domNode.style.transform += "scale(" + this.getScaleX() + ", " + this.getScaleY() + ")";
        }
        if (this.refX !== undefined && this.refY !== undefined) {
            this.domNode.style.transformOrigin = "" + (this.refX * 100) + "% " + (this.refY * 100) + "%";
            this.domNode.style.MozTransformOrigin = "" + (this.refX * 100) + "% " + (this.refY * 100) + "%";
            this.domNode.style.webkitTransformOrigin = "" + (this.refX * 100) + "% " + (this.refY * 100) + "%";
        }
        if (this.width !== undefined && this.height !== undefined) {
            this.domNode.style.width = "" + this.width + "px";
            this.domNode.style.height = "" + this.height + "px";
        }
        this.domNode.style.left = (this.x - this.getRefPosX() + ((this.getParent() != null) ? this.getParent().getRefPosX() : 0)) + "px";
        this.domNode.style.top = (this.y - this.getRefPosY() + ((this.getParent() != null) ? this.getParent().getRefPosY() : 0)) + "px";
        this.domNode.setAttribute("id", "do" + this.id);

    }

    DisplayObject.prototype.setId = function(id) {
        this.id = id;
        if (this.name == null || this.name == "") {
            this.name = "new" + id;
        }
    }

    DisplayObject.prototype.getId = function() {
        return this.id;
    }
    /**
     * Adds an event to this object
     */
    DisplayObject.prototype.addEventListener = function(eventStr, func) {
        if (this.domNode.addEventListener) {
            this.domNode.addEventListener(eventStr, func, false);
        } else if (this.domNode.attachEvent) {
            this.domNode.attachEvent('on' + eventStr, func);
        }
    }
    /**
     * Creates the Dom node of this Element
     */
    DisplayObject.prototype.createDomNode = function() {
        this.domNode = document.createElement("div");
        if (this.id === undefined) {
            this.setId(DisplayObject.elementListLength);
            DisplayObject.elementListLength++;
            DisplayObject.elementList["do" + this.id] = (this);
        }
        this.updateDom();
    }
    /**
     * Returns the Dom representation of this element and creates it if not existent
     */
    DisplayObject.prototype.getDomNode = function() {
        if (this.domNode === undefined) {
            this.createDomNode();
        }
        return this.domNode;
    }
    /**
     * Sets the Position of this element
     */
    DisplayObject.prototype.setPos = function(x, y) {
        this.x = x;
        this.y = y;

        if (this.domNode != undefined) {
            this.domNode.style.left = (this.x - this.getRefPosX() + ((this.getParent() != null) ? this.getParent().getRefPosX() : 0)) + "px";
            this.domNode.style.top = (this.y - this.getRefPosY() + ((this.getParent() != null) ? this.getParent().getRefPosY() : 0)) + "px";
        }
    }
    /**
     * Set the DOM Node of this element 
     */
    DisplayObject.prototype.setDomNode = function(domNode) {
        this.domNode = domNode;
    }
    /**
     * Appends a child to this Element
     */
    DisplayObject.prototype.addChild = function(child) {
        if (require('engine/AnimEn').getAnimationMode() == require('engine/AnimEn').ANIMATION_MODE_DOM) {
            if (this.domNode === undefined) {
                this.createDomNode();
            }
            this.domNode.appendChild(child.getDomNode());
        }
        this.children[child.name] = child;
        child.setParent(this);
    }
    /**
     * Returns the rotation of all parent elements
     */
    DisplayObject.prototype.getParentRotation = function() {
        var fullRotation = 0;
        var currObj = this.getParent();
        while (currObj !== undefined) {
            fullRotation = fullRotation + parseInt(currObj.getRotation());
            currObj = currObj.getParent();
        }
        return fullRotation;
    }
    /**
     * Returns the Scaling of the Parent, including sup scalings
     */
    DisplayObject.prototype.getParentScale = function() {
        var fullScaleX = 1;
        var fullScaleY = 1;
        var currObj = this.getParent();
        while (currObj !== undefined) {
            fullScaleX = fullScaleX * currObj.getScaleX();
            fullScaleY = fullScaleY * currObj.getScaleY();
            currObj = currObj.getParent();
        }
        return {
            scaleX : fullScaleX,
            scaleY : fullScaleY
        };
    }
    /**
     * Sets the Stage position of the current element
     */
    DisplayObject.prototype.setStagePos = function(posX, posY) {
        if (this.getParent() !== null && this.getParent() !== undefined) {
            parentRefStagePos = this.getParent().getRefStagePos();
            parentRotation = this.getParentRotation();
            parentScale = this.getParentScale();
        } else {
            parentRefStagePos = {
                x : 0,
                y : 0
            };
            parentRotation = 0;
            parentScale = {
                scaleX : 1,
                scaleY : 1
            };
        }
        var distX = posX - parentRefStagePos.x;
        var distY = posY - parentRefStagePos.y;

        var newPosX = distX * Math.cos(-parentRotation * 0.017453292519943) - distY * Math.sin(-parentRotation * 0.017453292519943);
        var newPosY = distX * Math.sin(-parentRotation * 0.017453292519943) + distY * Math.cos(-parentRotation * 0.017453292519943);
        this.setX(newPosX);
        this.setY(newPosY);
    }
    /**
     * Retruns the Stage Position of the reference point of this Display Object
     */
    DisplayObject.prototype.getRefStagePos = function() {
        var distToRefX, distToRefY;
        var newPosX = 0, newPosY = 0;
        var distCurrRefX = this.getX();
        var distCurrRefY = this.getY();
        var currObj = this.getParent();
        var fullRotation = this.getRotation();
        var fullScaleX = this.getScaleX();
        var fullScaleY = this.getScaleY();
        //var Vector2d = require('engine/Vector2d');
        var vec = new Vector2d(distCurrRefX, distCurrRefY);
        // iterate through the parents to find the real Stage Position
        while (currObj !== undefined) {
            // Scaling has to be done first
            vec.scale(currObj.getScaleX(), currObj.getScaleY());
            vec.rotate(currObj.getRotation());
            // After transforming the old Position with the parameters of the current sceneNode the own position can be added
            vec.add(currObj.getX(), currObj.getY());
            // Save the full rotation and scale
            fullRotation = parseInt(fullRotation) + parseInt(currObj.getRotation());
            fullScaleX = fullScaleX * currObj.getScaleX();
            fullScaleY = fullScaleY * currObj.getScaleY();

            currObj = currObj.getParent();
        }

        return {
            x : vec.getX(),
            y : vec.getY(),
            rotation : fullRotation,
            scaleX : fullScaleX,
            scaleY : fullScaleY
        };
    }
    /**
     * Creates and retruns the string representation of this object
     */
    DisplayObject.prototype.toJSON = function() {

        var str = {
            name : this.name,
            x : this.x,
            y : this.y
        };
        var children = {};
        for (key in this.children) {
            children[key] = this.children[key].toJSON();
        }
        str["children"] = children;
        str["id"] = this.id;
        if (this.z !== undefined) {
            str["z"] = this.z;
        }
        if (this.refX !== undefined) {
            str["refX"] = this.refX;
        }
        if (this.refY !== undefined) {
            str["refY"] = this.refY;
        }
        if (this.scaleX !== undefined) {
            str["scaleX"] = this.scaleX;
        }
        if (this.scaleY !== undefined) {
            str["scaleY"] = this.scaleY;
        }
        if (this.rotation !== undefined) {
            str["rotation"] = this.rotation;
        }
        if (this.width !== undefined) {
            str["width"] = this.getWidth();
        }
        if (this.height !== undefined) {
            str["height"] = this.getHeight();
        }

        return str;

    }
    /**
     * Returns the DisplayObject with the given id
     */
    DisplayObject.getElementById = function(id) {
        return DisplayObject.elementList[id];
    }
    /**
     * Returns the DisplayObject with the given id
     */
    DisplayObject.prototype.getElementById = function(id) {
        return DisplayObject.getElementById(id);
    }
    /**
     * Returns the DisplayObject by searching all the Child Elements (slow -> getElementById is better)
     */
    DisplayObject.prototype.findById = function(id) {
        if (this.id == id) {
            return this;
        } else if (this.children !== undefined) {
            for (var key in this.children) {
                var child = this.children[key].findById(id);
                if (child !== undefined) {
                    return child;
                }
            }
        }
        return undefined;
    }
    /**
     * Returns the DisplayObject by searching all the Child Elements for the name
     */
    DisplayObject.prototype.findByName = function(name) {
        if (this.name === name) {
            return this;
        } else if (this.children !== undefined) {
            for (var key in this.children) {
                var child = this.children[key].findByName(name);
                if (child !== undefined) {
                    return child;
                }
            }
        }
        return undefined;
    }
    /**
     * Updates the Parent of this object
     * @param {Object} parent
     */
    DisplayObject.prototype.setParent = function(parent) {
        if (this.parent !== null && this.parent !== undefined && this.parent !== parent) {
            this.parent.removeChild(this);
        }
        this.parent = parent;
    }

    DisplayObject.prototype.getName = function() {
        return this.name;
    }

    DisplayObject.prototype.setName = function(name) {
        if (this.getParent() != null) {
            delete this.getParent().children[this.name];
            this.getParent().children[name] = this;
        }
        this.name = name;
    }

    DisplayObject.prototype.getParent = function() {
        return this.parent;
    }

    DisplayObject.prototype.getX = function() {
        return this.x | 0;
    }

    DisplayObject.prototype.getY = function() {
        return this.y | 0;
    }

    DisplayObject.prototype.setX = function(x) {
        this.x = x;
        this.updateDom();
    }

    DisplayObject.prototype.setY = function(y) {
        this.y = y;
        this.updateDom();
    }

    DisplayObject.prototype.getScaleX = function() {
        return (this.scaleX === undefined ? 1 : this.scaleX);
    }

    DisplayObject.prototype.getScaleY = function() {
        return (this.scaleY === undefined ? 1 : this.scaleY);
    }

    DisplayObject.prototype.setScaleX = function(scaleX) {
        this.scaleX = scaleX;
        this.updateDom();
    }

    DisplayObject.prototype.setScaleY = function(scaleY) {
        this.scaleY = scaleY;
        this.updateDom();
    }

    DisplayObject.prototype.getOffsetX = function() {
        if (this.parent !== undefined) {
            return this.parent.getOffsetX() + (this.x | 0);
        } else {
            return this.x | 0;
        }
    }

    DisplayObject.prototype.getOffsetY = function() {
        if (this.parent !== undefined) {
            return this.parent.getOffsetY() + (this.y | 0);
        } else {
            return this.y | 0;
        }
    }

    DisplayObject.prototype.getWidth = function() {
        return (this.width != undefined ? this.width : 0);
    }

    DisplayObject.prototype.getHeight = function() {
        return (this.height != undefined ? this.width : 0);
    }

    DisplayObject.prototype.getScaledWidth = function() {
        return this.getWidth() * this.getScaleX();
    }

    DisplayObject.prototype.getScaledHeight = function() {
        return this.getHeight() * this.getScaleY();
    }

    DisplayObject.prototype.setHeight = function(height) {
        this.height = height;
        this.updateDom();
        this.updateChildren();
    }

    DisplayObject.prototype.setWidth = function(width) {
        this.width = width;
        this.updateDom();
        this.updateChildren();
    }

    DisplayObject.prototype.getRotation = function() {
        return (this.rotation == undefined ? 0 : this.rotation);
    }

    DisplayObject.prototype.setRotation = function(rotation) {
        this.rotation = rotation;
        this.updateDom();
    }

    DisplayObject.prototype.getRefX = function() {
        return (this.refX !== undefined ? this.refX : 0.5);
    }

    DisplayObject.prototype.getRefY = function() {
        return (this.refY !== undefined ? this.refY : 0.5);
    }
    /**
     * Updates the children of this element
     */
    DisplayObject.prototype.updateChildren = function() {
        for (var childIndex in this.children) {
            var child = this.children[childIndex];
            child.updateDom();
        }
    }

    DisplayObject.prototype.setRefX = function(ref) {
        var diff = parseFloat((ref - this.refX) * this.getWidth());
        this.x += diff;
        for (var childIndex in this.children) {
            var child = this.children[childIndex];
            child.x -= diff;
            child.updateDom();
        }
        this.refX = ref;
        this.updateDom();
    }

    DisplayObject.prototype.setRefY = function(ref) {
        var diff = parseFloat((ref - this.refY) * this.getHeight());
        this.y += diff
        for (var childIndex in this.children) {
            var child = this.children[childIndex];
            child.y -= diff;
            child.updateDom();
        }
        this.refY = ref;
        this.updateDom();
    }
    

    DisplayObject.prototype.getRefPosX = function() {
        return this.getRefX() * this.getWidth();
    }

    DisplayObject.prototype.getRefPosY = function() {
        return this.getRefY() * this.getHeight();
    }

    DisplayObject.prototype.setZIndex = function(z) {
        this.z = z;
        this.updateDom();
    }

    DisplayObject.prototype.getZIndex = function() {
        return this.z
    }
    DisplayObject.prototype.getChildren = function() {
        return this.children;
    }
    
    /**
     * Removes the given child of this object 
     */
    DisplayObject.prototype.removeChild = function(obj) {
        if (this.children[obj.getName()] !== undefined) {
            delete this.children[obj.getName()];
            this.domNode.removeChild(obj.domNode);
        }
    }
    /**
     * Removes all children of this object
     */
    DisplayObject.prototype.removeAllChildren = function() {
        for (var key in this.children) {
            this.removeChild(this.children[key]);
        }
    }

    DisplayObject.prototype.getType = function() {
        return this.type;
    }
    
    /**
     * Sets the visibility of this object 
     * @param {Boolean} value True or False
     */
    DisplayObject.prototype.setVisible = function(value) {
        if (this.domNode != null) {
            if (value == true) {
                this.domNode.style.display = "";
            } else {
                this.domNode.style.display = "none";
            }
        }
    }
    
    // return constructor
    return DisplayObject;
}); 