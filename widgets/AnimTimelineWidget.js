require(["dojo/_base/declare", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_Templated", "dojo/io/script", "dojo/dom", "dojo/text!./widgets/templates/animtimelinewidget.html", "engine/AnimObject", "lib/jquery.js"], function(declare, _Widget, _TemplatedMixin, _Templated, script, domConstruct, template, AnimObject) {

    return declare("widgets.AnimTimelineWidget", [_Widget, _TemplatedMixin], {
        MOUSE_BUTTON_RIGHT: 2,
        TIMELINE_WIDTH: 8000,
        templateString : template,
        autoKeyframe: false, // Disable Automatic Keyframing
        scrubberOffsetX : 0,
        scrubberRefX : -1,
        scrubberPosX : 0,
        //var offsetY: 0,
        scrubberSelected : false,
        movedKeyframe : false,
        keyframeSelected : false,
        scrollLeft : 0,
        keyframeX : 0,
        selectedKeyframe : undefined,
        keyframeRefX : 0,
        gridSize : 16,
        scrubberPosX : undefined,
        scrubberStartX : undefined,
        stageInitialized: false,
        objectInfoView: undefined,
        timelineView: undefined,
        stageObjects: {},
        activeScene: undefined,
        stage: undefined,
        defaultScene:"defaultAnim",
        /** Called after creation of the widget and initializes the necessary files for this widget */
        postCreate : function() {
            dojo.create("link", {
                rel : "stylesheet",
                href : "./widgets/templates/css/timeline.css"
            }, dojo.query("head")[0]);
        },
        /** Called on startup of this widget and initializes the subscribers */
        startup : function() {
            this.init();
            dojo.subscribe("/animwidget/initStage", this, "onInitStage");
            dojo.subscribe("/animwidget/updateObject", this, "onUpdateObject");
            dojo.subscribe("/animwidget/addObject", this, "onAddObject");
            dojo.subscribe("/layerwidget/updateLayerPosition", this, "onUpdateLayerPosition");
            dojo.subscribe("/layerwidget/updateObject", this, "onChangeObject");
            
            
            if (!this.stageInitialized) {
                dojo.publish("/animtimelinewidget/requestInitStage", []);
            }
        },
        
        
        /** Initializes the Timeline and appends the necessary listeners */
        init : function() {
            this.objectInfoView = $("#objectInfoView");
            this.timelineView = $("#timelineView");
            this.timelineView[0].style.width = this.TIMELINE_WIDTH + "px";
            
            this.objectInfoView.empty();
            this.timelineView.empty();
            this.timelineView.append('<div id="scrubberLine" style="left: 8px;"></div>');
            this.scrubberStartX = $("#timelineScrubber")[0].offsetLeft;
            this.scrubberPosX = $("#timelineScrubber")[0].offsetLeft;
            
            this.stageObjects = {};

            $("#timelineScrollContainer").scroll(this, function(e) {
                // Scroll the header to the left
                e.data.scrollLeft = $("#timelineScrollContainer").scrollLeft();
                $("#timelineHeaderScroller").scrollLeft(this.scrollLeft);
                // Scroll the info view on the left with the timeline
                $("#objectInfoView").scrollTop($("#timelineScrollContainer").scrollTop());
            });

            $(".keyframe").on("mousedown", this, function (e) {
                e.data.onKFMouseDown(e);
                e.data.selectedKeyframe = this; // set the selected keyframe to the current selected div
                
            });
            
            $("#timelineScrubber").on("mousedown", $.proxy(this.onMouseDown, this));
            $(window).on("mousemove", $.proxy(this.onMouseMove, this));
            $(window).on("mouseup", $.proxy(this.onMouseUp, this));
            
            

            $("#scrubberLine").css("left", (this.scrubberPosX + 8) + "px");
            
            $("#objectInfoView").on("DOMMouseScroll", function(event, delta) {
                // Handle Scroll Event on #objectInfoView on the left
                // Only the right area with the #timelineScrollContainer has a scroll container
                // But the left side has to be aligned to the right
                var delta = 0;
                if (!event) { /* IE. */
                    event = window.event;
                }
                if (event.wheelDelta) { /* IE/Opera. */
                    delta = event.wheelDelta/120;
                } else if (event.detail) { /* Mozilla */
                    delta = -event.detail/3;
                } else if (event.originalEvent && event.originalEvent.detail) { /* Mozilla */
                    delta = event.originalEvent.detail/3*2;
                }
                $("#timelineScrollContainer").scrollTop($("#timelineScrollContainer").scrollTop() + (delta * 30));
            });
            
            var tlHeader = $("#timelineHeader");
            tlHeader[0].style.width = this.TIMELINE_WIDTH + "px";
            var val;
            for (var i = 1; i < this.TIMELINE_WIDTH / 16; i++) {
                val = "";
                if (i === 1 || (i % 5) === 0) {
                    val = "" + i;
                }
                tlHeader.append("<span>" + val + "</span>");
            }
        },
        onAddObject:function(obj) {
            var currObj = obj;
            var depth = 0;
            while(currObj.getParent() != undefined && currObj.getParent() != this.stage) {
                depth += 10;
                currObj = currObj.getParent();
            }
            var parentNode;
            if (obj.getParent() !== undefined && obj.getParent() !== this.stage) {
                parentNode = this.stageObjects[obj.getParent().getId()].objectNode;
            } else {
                parentNode = this.objectInfoView;
            }
            
            this.initLayer(obj, depth, parentNode);
            this.initAnimations(obj);
        },
        
        
        onUpdateLayerPosition: function(objId, oldParentId, newParentId) {
            var obj = this.stage.findById(parseInt(objId));
            if (obj !== null && obj !== undefined) {
                var currObj = obj;
                var depth = 0;
                
                var oldParentObj = this.stage.findById(parseInt(oldParentId));
                var newParentObj = this.stage.findById(parseInt(newParentId));
                
                this.moveLayer(obj, oldParentObj, newParentObj);
                
            }
        },
        
        
        moveLayer: function (displObj, oldParentObj, newParentObj) {
            if (newParentObj == undefined) {
                // Add to stage
                this.objectInfoView[0].appendChild(this.stageObjects[displObj.getId()].objectNode[0]);
            } else {
                this.stageObjects[newParentObj.getId()].objectNode[0].appendChild(this.stageObjects[displObj.getId()].objectNode[0]);
            }
        },
        
        onChangeObject:function(change, displObj) {
            if (change.deleteObject !== undefined && change.deleteObject === true) {
                this.removeLayer(displObj);
                delete this.stageObjects[displObj.getId()];
            }
            if (change.name !== undefined) {
                this.stageObjects[displObj.getId()].objectNode[0].children[0].children[0].textContent = change.name;
            }
        },
        
        removeLayer: function(diplObj) {
            var parentObj = diplObj.getParent();
            var parentObjNode;
            if (parentObj !== undefined && parentObj !== this.stage) {
                parentObjNode = this.stageObjects[parentObj.getId()].objectNode[0];
            } else {
                parentObjNode = this.objectInfoView[0];
            }
            parentObjNode.removeChild(this.stageObjects[diplObj.getId()].objectNode[0]);
            this.timelineView[0].removeChild(this.stageObjects[diplObj.getId()].timelineNode[0]);
        },
        
        /** Updates the selected Object with the new transformation and saves them to the current Keyframe*/
        onUpdateObject: function (displObj) {
            var keyframeId = this.scrubberPosX / this.gridSize;
            if (displObj !== undefined && displObj !== null && this.stageObjects[displObj.getId()][this.activeScene] !== undefined) {
                var keyframe = this.stageObjects[displObj.getId()][this.activeScene][keyframeId + 1];
                if (keyframe !== undefined) {
                    this.setValue(displObj.getX(), keyframe, "x");
                    this.setValue(displObj.getY(), keyframe, "y");
                    this.setValue(displObj.getRotation(), keyframe, "rotation");
                    this.setValue(displObj.getRefX(), keyframe, "refX");
                    this.setValue(displObj.getRefY(), keyframe, "refY");
                    this.setValue(displObj.getZIndex(), keyframe, "zIndex");
                    //this.setValue(displObj.getScaleX(), keyframe, "scaleX");
                    //this.setValue(displObj.getScaleY(), keyframe, "scaleY");
                    
                    this.calculateInbetween(displObj.getId(), keyframeId + 1, this.stageObjects[displObj.getId()][this.activeScene], this.activeScene, true, true);
                    //stageObjectId, keyframePos, animParams, scene, searchBackward, searchForward) {
                }
            }
        },
        /** Sets the Value of an updated object to that objects keyframe */
        setValue: function (val, keyframe, key) {
            if (keyframe !== undefined) {
                if (val !== undefined) {
                    keyframe[key] = val;
                }
                
            }
        },
        /** Is Called when the Stage is initialized and initializes the animations of the stage */
        onInitStage: function (stage) {
            this.stage = stage;
            var children = stage.getChildren();
            this.stageObjects = {};
            // reinit the list elements
            this.objectInfoView.empty();
            this.timelineView.empty();
            this.timelineView.append('<div id="scrubberLine" style="left: 8px;"></div>');
            this.scrubberStartX = $("#timelineScrubber")[0].offsetLeft;
            this.scrubberPosX = $("#timelineScrubber")[0].offsetLeft;
            
            this.initLayer(this.stage, -1);
            this.initAnimations(this.stage);
            
            
            this.updateAnimation((this.scrubberPosX / this.gridSize + 1));
        },
        /** Updates the animation for the given Keyframe Position and sends messages to update the other widgets */
        updateAnimation: function (keyframePos) {
            for (var key in this.stageObjects) {
                var obj = this.stageObjects[key]; // Iterate over all stage elemets
                if (obj[this.activeScene]) {
                    if (obj[this.activeScene][keyframePos]) {
                        dojo.publish("/animtimelinewidget/updateObject", [obj[this.activeScene][keyframePos], obj.displObj]);
                    } else {
                        dojo.publish("/animtimelinewidget/updateObject", [obj["inbetween"][this.activeScene][keyframePos], obj.displObj]);
                    }
                }
            }
            
        },
        /** Initializes the animations and creates the keyframe handler */
        initAnimations: function (displObj) {
            if (displObj instanceof AnimObject) {
                
                //this.stageObjects[displObj.getId()] = {};
                for (var currScene in displObj.animations) { // iterate the scenes
                    if (this.activeScene === undefined) {
                        this.activeScene = currScene;
                    }
                    var scene = displObj.animations[currScene];
                    for (var displObjId in scene.tween) { // iterate over the elements in the scene
                        var animParams = scene.tween[displObjId];
                        var lastKeyframePos = -1;
                        var obj = displObj.findById(displObjId);
                        this.stageObjects[obj.getId()][currScene] = animParams; // stageObjects["armL"]["idle"]
                        for (var keyframeId in animParams) { // iterate over the keyframes of each element
                            var pos = parseInt(keyframeId);
                            this.addKeyframe(obj, pos, animParams, currScene, true);
                        }
                    }
                }
            }
            for (var key in displObj.children) {
                this.initAnimations(displObj.children[key]);
            }
        },
        /** Calculates the inbetween of a given keyframePos */
        calculateInbetween: function(stageObjectId, keyframePos, animParams, scene, searchBackward, searchForward, deleteMiddleKf) {
            if (this.stageObjects[stageObjectId]["inbetween"] === undefined) {
                this.stageObjects[stageObjectId]["inbetween"] = {};
            }
            if (this.stageObjects[stageObjectId]["inbetween"][scene] === undefined) {
                this.stageObjects[stageObjectId]["inbetween"][scene] = {};
            }
            var lastKeyframe = 99;
            var inbetween = this.stageObjects[stageObjectId]["inbetween"][scene];
            var j;
            for (var key in animParams[keyframePos]) { // iterate over the animTypes (rotation)
                var startPos = -1;
                var endPos = -1;
                if (searchBackward) {
                    //we have to search for the start of the animType
                    // it could also be that the animType is not defined here
                    j = keyframePos - 1;
                    while (j > 0 && (animParams[j] === undefined || animParams[j][key] === undefined)) {
                        j--;
                    }
                    if (j > 0 || (animParams[j] !== undefined && animParams[j][key] !== undefined)) {
                        startPos = j;
                    }
                }
                if (searchForward) {
                    // search the next keyframe with this animationType after this one
                    j = keyframePos + 1;
                    while (j < lastKeyframe && (animParams[j] === undefined || animParams[j][key] === undefined)) {
                        j++;
                    }
                    if (j < lastKeyframe || (animParams[j] !== undefined && animParams[j][key] !== undefined)) {
                        endPos = j;
                    }
                }
                if (deleteMiddleKf) {
                    if (startPos > 0 && endPos > 0) {
                        // Overwrite the middle keyframe from start to end with inbetweens
                        var dif = animParams[endPos][key] - animParams[startPos][key];
                        var difEach = dif / (endPos - startPos);
                        var val = 0;
                        for (var i = startPos + 1; i < endPos; i++) {
                            val = val + difEach;
                            if (inbetween[i] === undefined) {
                                inbetween[i] = {};
                            }
                            inbetween[i][key] = animParams[startPos][key] + val;
                        }
                    } else {
                        // If either start or end is undefined there is just one keyframe (or none) and all the inbetweens can be deleted
                        if (startPos < 0) {
                            startPos = 0;
                        }
                        if (endPos < 0) {
                            endPos = lastKeyframe;
                        }
                        for (var i = startPos + 1; i < endPos; i++) {
                            if (inbetween[i] != undefined) {
                                delete inbetween[i][key];
                            }
                        }
                    }
                } else {
                    if (startPos > 0) {
                        var dif = animParams[keyframePos][key] - animParams[startPos][key];
                        var difEach = dif / (keyframePos - startPos);
                        var val = 0;
                        for (var i = startPos + 1; i < keyframePos; i++) {
                            val = val + difEach;
                            if (inbetween[i] === undefined) {
                                inbetween[i] = {};
                            }
                            inbetween[i][key] = animParams[startPos][key] + val;
                        }
                    }
                    if (endPos > 0) {
                        var dif = animParams[endPos][key] - animParams[keyframePos][key];
                        var difEach = dif / (endPos - keyframePos);
                        var val = 0;
                        for (var i = keyframePos + 1; i < endPos; i++) {
                            val = val + difEach;
                            if (inbetween[i] === undefined) {
                                inbetween[i] = {};
                            }
                            inbetween[i][key] = animParams[keyframePos][key] + val;
                        }
                    }
                }
                
            }
        },
        /** Adds a new Keyframe to the animation */
        addKeyframe: function (stageObject, keyframeId, animParams, scene, init) {
            var stageObjectId = stageObject.getId();
            if (scene === undefined) {
                scene = this.defaultScene;
            }
            if (this.activeScene === undefined) {
                this.activeScene = this.defaultScene;
            }
            if (keyframeId >= 1 && animParams !== undefined) {
                this.calculateInbetween(stageObjectId, keyframeId, animParams, scene, true, !init); // if the keyframes are initialized the keyframes don't need to be searched forwards
            }
            if (!init) { // If this is not the initial appending of the keyframes we have to add our keyframe to the stage object
                var animObj = stageObject;
                while(animObj !== undefined && animObj !== null && !(animObj instanceof AnimObject)) {
                    animObj = animObj.getParent();
                }
                if (animObj === undefined) {
                    animObj = this.stage;
                }
                if (animObj.animations[scene] !== undefined && (animObj.animations[scene]["tween"] === undefined || animObj.animations[scene]["tween"][stageObjectId] === undefined)) {
                    if (animObj.animations[scene]["tween"] === undefined) {
                        animObj.animations[scene]["tween"] = {};
                    }
                    animObj.animations[scene]["tween"][stageObjectId] = {};
                    this.stageObjects[stageObjectId][scene] = animObj.animations[this.activeScene]["tween"][stageObjectId];
                }
            
                this.stageObjects[stageObjectId][scene][keyframeId] = {}; // stageObjects["armL"]["idle"]
            }
            var keyframeNode = $('<div class="keyframe" style="left: ' + ((keyframeId - 1) * this.gridSize) + 'px;"></div>');
            keyframeNode.on("mousedown", this, function (e) {
                e.data.onKFMouseDown(e);
                e.data.selectedKeyframe = this; // set the selected keyframe to the current selected div
            });
            this.stageObjects[stageObjectId]["timelineNode"].append(keyframeNode);
        },
        
        /**
         * Removes a keyframe form the timeline and updates the inbetweens 
         */
        removeKeyframe: function() {
            if (this.selectedKeyframe != null && this.selectedKeyframe.parentElement != null) {
                var kfParent = this.selectedKeyframe.parentElement;
                var obj;
                // Find displayObject by keyframe
                for (var key in this.stageObjects) {
                    obj = this.stageObjects[key];
                    if (obj["timelineNode"] != null && obj["timelineNode"][0] == kfParent) {
                        break;
                    }
                    
                }
                
                if (obj["timelineNode"] != null && obj["timelineNode"][0] == kfParent) {
                    if (obj[this.activeScene] != null) {
                        var keyframes = obj[this.activeScene];
                        var kfPos = this.fitToGrid(this.selectedKeyframe.offsetLeft);
                        var kfId = kfPos / this.gridSize + 1;
                        
                        
                        this.calculateInbetween(obj.displObj.getId(), kfId, keyframes, this.activeScene, true, true, true);
                        
                        kfParent.removeChild(this.selectedKeyframe);
                        delete keyframes[kfId];
                        
                    }
                }
            }
                
        },
        /**
         * Saves the new position of the selected and moved keyframe 
         */
        moveKeyframe: function() {
            if (this.selectedKeyframe != null && this.selectedKeyframe.parentElement != null) {
                var kfParent = this.selectedKeyframe.parentElement;
                var obj;
                // Find displayObject by keyframe
                for (var key in this.stageObjects) {
                    obj = this.stageObjects[key];
                    if (obj["timelineNode"] != null && obj["timelineNode"][0] == kfParent) {
                        break;
                    }
                    
                }
                
                if (obj["timelineNode"] != null && obj["timelineNode"][0] == kfParent) {
                    if (obj[this.activeScene] != null) {
                        var keyframes = obj[this.activeScene];
                        var kfPos = this.fitToGrid(this.keyframePos); // The id of the keyframe ist the original position
                        var newKfPos = this.fitToGrid(this.selectedKeyframe.offsetLeft);
                        var kfId = kfPos / this.gridSize + 1;
                        var newKfId = newKfPos / this.gridSize + 1;
                        keyframes[newKfId] = keyframes[kfId]; // set the new pos
                        delete keyframes[kfId];
                        
                        this.calculateInbetween(obj.displObj.getId(), newKfId, keyframes, this.activeScene, true, true);
                        
                        
                        
                    }
                }
            }
                
        },
        
        /** Initializes the Layer and creates the Timeline Objects and Keyframes */
        initLayer: function (displObj, depth, parentNode) {
            var objectNode;
            var keyframeNode;
            
            if (depth >= 0) {
                objectNode = $('<div class="objectInfo expanded"></div>');
                objectNode.append('<div class="objectWrapper"><span style="padding-left:' + depth + '">' + displObj.getName() + '</span><div class="objectVisible"></div></div>');
                keyframeNode = $('<div class="objectTimeline"></div>');
                
                keyframeNode.click({that: this, displObj: displObj}, function(event) {
                    var that = event.data.that;
                    var pos = that.fitToGrid((event.pageX - $(event.target).offset().left) + that.gridSize / 2);
                    var keyframeId = pos / that.gridSize;
                    if (that.stageObjects[event.data.displObj.getId()] == undefined) {
                        that.stageObjects[event.data.displObj.getId()] = {};
                        that.stageObjects[event.data.displObj.getId()][that.activeScene] = {};
                    }
                    that.addKeyframe(event.data.displObj, keyframeId, that.stageObjects[event.data.displObj.getId()][that.activeScene], that.activeScene, false);
                });
                
                if (parentNode === undefined) {
                    parentNode = this.objectInfoView;
                }
                
                parentNode.append(objectNode);
                this.timelineView.append(keyframeNode);
            }
            this.stageObjects[displObj.getId()] = {displObj: displObj, timelineNode: keyframeNode, objectNode: objectNode};
            
            for (var key in displObj.children) {
                this.initLayer(displObj.children[key], depth + 10, objectNode);
            }
        },
        /** Keyframe dragging */
        onKFMouseDown : function(e) {
            if(e.preventDefault) {
                e.preventDefault(); // Prevent image Dragging
            }
            if(e.stopPropagation) {
                e.stopPropagation(); // Prevent Bubbeling down the Event
            }
            this.keyframeSelected = true;
            this.keyframePos = e.target.offsetLeft;
            this.movedKeyframe = false;
            this.keyframeRefX = e.clientX - e.target.offsetLeft;
        },
        /** Scrubber dragging */
        onMouseDown : function(e) {
            if(e.preventDefault) {
                e.preventDefault(); // Prevent image Dragging
            }
            if(e.stopPropagation) {
                e.stopPropagation(); // Prevent Bubbeling down the Event
            }
            this.scrubberRefX = e.clientX - $("#timelineScrubber")[0].offsetLeft;
            this.scrubberSelected = true;
        },
        /** Move the scrubber or the keyframes */
        onMouseMove : function(e) {
            if(this.scrubberSelected) {
                this.scrubberPosX = this.fitToGrid(e.clientX - this.scrubberRefX);
                if(this.scrubberPosX < 0) {
                    this.scrubberPosX = 0;
                }
                this.updateAnimation((this.scrubberPosX / this.gridSize + 1));
                $("#timelineScrubber").css("left", (this.scrubberPosX) + "px");
                $("#scrubberLine").css("left", (this.scrubberPosX + 8) + "px");
            } else if(this.keyframeSelected) {
                this.keyframeX = this.fitToGrid(e.clientX - this.keyframeRefX);
                if(this.keyframeX < 0) {
                    this.keyframeX = 0;
                }
                this.movedKeyframe = true;
                $(this.selectedKeyframe).css("left", (this.keyframeX) + "px");
            }
        },
        /** Leave the keyframe or the scrubber */
        onMouseUp : function(e) {
            if (this.keyframeSelected && !this.movedKeyframe && e.button == this.MOUSE_BUTTON_RIGHT) {
                // Remove Keyframe
                this.removeKeyframe(e);
            } else if (this.movedKeyframe) {
                this.moveKeyframe(e);
            }
            this.scrubberSelected = false;
            this.movedKeyframe = false;
            this.keyframeSelected = false;
            e.preventDefault();
        },
        /** Firs the current x value to the grid of the Keyframes*/
        fitToGrid : function(x) {
            var toFit = x;
            toFit = parseInt((toFit + (this.gridSize/ 2)) / this.gridSize) * this.gridSize;

            return toFit;
        },
    });

});
