require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "dojo/text!./widgets/templates/keyframewidget.html", "engine/util/CubicBezier", "dojo/_base/json"], function(declare, _Widget, _Templated, script, domConstruct, template, CubicBezier) {

	return declare("widgets.KeyframeWidget", [_Widget, _Templated], {
		templateString : template,
		keyframeTypeSelect : null,
		selectKeyframe: "selectKeyframe",
		changeKeyframe: "changeKeyframe",
		keyframeBezier : null,
		selectedType : "linear",
		keyframeCanvasSize : 200,
		ctx : null,
		dragRadius : 10,
		dragPoint : null,
		selectedBezier : false,
		pointsPercent : {
			p0 : {
				x : 0,
				y : 0
			},
			p1 : {
				x : 0,
				y : 0
			},
			p2 : {
				x : 1,
				y : 1
			},
			p3 : {
				x : 1,
				y : 1
			}
		},
		points : {
			p0 : {
				x : 0,
				y : 200
			},
			p1 : {
				x : 0,
				y : 200
			},
			p2 : {
				x : 200,
				y : 0
			},
			p3 : {
				x : 200,
				y : 0
			}
		},
		keyframeTypes : {
			linear : {
				text : "Linear",
				p1 : {
					x : 0,
					y : 0
				},
				p2 : {
					x : 1,
					y : 1
				}
			},
			ease : {
				text : "Ease",
				p1 : {
					x : 0.25,
					y : 0.1
				},
				p2 : {
					x : 0.25,
					y : 1
				}
			},
			easeInOut : {
				text : "Ease-in-out",
				p1 : {
					x : 0.42,
					y : 0
				},
				p2 : {
					x : 0.58,
					y : 1
				}
			},
			easeIn : {
				text : "Ease-in",
				p1 : {
					x : 0.42,
					y : 0
				},
				p2 : {
					x : 1,
					y : 1
				}
			},
			easeOut : {
				text : "Ease-out",
				p1 : {
					x : 0,
					y : 0
				},
				p2 : {
					x : 0.58,
					y : 1
				}
			},
			custom : {
				text : "Custom",
				p1 : {
					x : 0,
					y : 0
				},
				p2 : {
					x : 1,
					y : 1
				}
			}
		},

		postCreate : function() {
			dojo.subscribe("/animtimelinewidget/selectKeyframe", this, "onSelectKeyframe");
			dojo.create("link", {
				rel : "stylesheet",
				href : "./widgets/templates/css/keyframewidget.css"
			}, dojo.query("head")[0]);
		},
		startup : function() {
			this.init();
		},
		/**
		 * This method is called when the inbetweens have to be updated 
		 */
		updateInbetweens: function() {
			var bezier = new CubicBezier(this.pointsPercent.p1.x, this.pointsPercent.p1.y, this.pointsPercent.p2.x, this.pointsPercent.p2.y);
			dojo.publish("/keyframewidget/updateinbetweens", [bezier, this.selectedObject, this.keyframeId]);
		},
		/**
		 * Initializes the Keyframe Widget
		 */
		init : function() {
			this.keyframeTypeSelect = dojo.byId("keyframeTypeSelect");

			for (var key in this.keyframeTypes) {
				dojo.create("option", {
					innerHTML : this.keyframeTypes[key].text,
					value : key,
					id : key
				}, this.keyframeTypeSelect);
			}

			dojo.connect(this.keyframeTypeSelect, "onchange", this, this.onSelectType);

			this.keyframeBezier = dojo.create("canvas", {
				width : this.keyframeCanvasSize,
				height : this.keyframeCanvasSize,
				id : "keyframeBezier"
			}, dojo.byId("bezier"));

			this.ctx = this.keyframeBezier.getContext("2d");

			dojo.connect(this.keyframeBezier, "onmousedown", this, this.onMouseDown);
			dojo.connect(this.keyframeBezier, "onmousemove", this, this.onMouseMove);
			dojo.connect(this.keyframeBezier, "onmouseup", this, this.onMouseUp);
			dojo.connect(this.keyframeBezier, "onmouseout", this, this.onMouseUp);
			
			dojo.connect(dojo.byId("p1X"), "onchange", this, this.changeInput);
			dojo.connect(dojo.byId("p1Y"), "onchange", this, this.changeInput);
			dojo.connect(dojo.byId("p2X"), "onchange", this, this.changeInput);
			dojo.connect(dojo.byId("p2Y"), "onchange", this, this.changeInput);
            
			this.updateTimingType(this.selectedType);
			
			dojo.byId(this.selectKeyframe).style.display = "";
			dojo.byId(this.changeKeyframe).style.display = "none";
		},
		/**
		 * Is called when an input field is changed 
		 */
		changeInput: function(e) {
			if (this.selectedType != "custom") {
				this.selectedType = "custom";
				this.keyframeTypeSelect.value = this.selectedType;
				this.updatePointsForType(this.selectedType);
			}
			
			if (e.target.id == "p1X") {
				this.pointsPercent.p1.x = e.target.value;
			} else if (e.target.id == "p1Y") {
				this.pointsPercent.p1.y = e.target.value;
			} else if (e.target.id == "p2X") {
				this.pointsPercent.p2.x = e.target.value;
			} else if (e.target.id == "p2Y") {
				this.pointsPercent.p2.y = e.target.value;
			}
			// Change the coordinate system in curve 0/0 is bottom left in canvas thas pos is 0/1
			this.points.p1.x = this.pointsPercent.p1.x * this.keyframeCanvasSize;
			this.points.p1.y = (1 - this.pointsPercent.p1.y) * this.keyframeCanvasSize;
			this.points.p2.x = this.pointsPercent.p2.x * this.keyframeCanvasSize;
			this.points.p2.y = (1 - this.pointsPercent.p2.y) * this.keyframeCanvasSize;
			
			this.updateTextFields();
			this.drawBezier();
			
			this.updateInbetweens();
		},
		/**
		 * Is called when a type is selected in the selectbox 
		 */
		onSelectType : function(e) {
			if (e.target.value != null && this.keyframeTypes[e.target.value] != null && e.target.value != "custom") {
				this.updateTimingType(e.target.value);
				
				this.setTimingFunc();
				this.updateInbetweens();
			}
		},
		/**
		 * Updates the points of the bezier curve for the given type 
		 */
		updatePointsForType : function(type) {
			if (this.keyframeTypes[type] != null && type != "custom") {
				this.pointsPercent.p1 = this.keyframeTypes[type].p1;
				this.pointsPercent.p2 = this.keyframeTypes[type].p2;

			} else if (type == "custom") {
				var p1 = this.pointsPercent.p1;
				var p2 = this.pointsPercent.p2;
				
				
				this.pointsPercent.p1 = {x:p1.x, y:p1.y};
				this.pointsPercent.p2 = {x:p2.x, y:p2.y};
			}
			
			// Change the coordinate system in curve 0/0 is bottom left in canvas thas pos is 0/1
			this.points.p1.x = this.pointsPercent.p1.x * this.keyframeCanvasSize;
			this.points.p1.y = (1 - this.pointsPercent.p1.y) * this.keyframeCanvasSize;
			this.points.p2.x = this.pointsPercent.p2.x * this.keyframeCanvasSize;
			this.points.p2.y = (1 - this.pointsPercent.p2.y) * this.keyframeCanvasSize;
		},
		/**
		 * Updates the thextfields with the current data
		 */
		updateTextFields : function() {
			dojo.byId("p1X").value = "" + this.pointsPercent.p1.x;
			dojo.byId("p1Y").value = "" + this.pointsPercent.p1.y;
			dojo.byId("p2X").value = "" + this.pointsPercent.p2.x;
			dojo.byId("p2Y").value = "" + this.pointsPercent.p2.y;
		},
		/**
		 * This method is called when a keyframe has been selected
		 * @param {DisplayObject} object DisplayObject of the keyframe
		 * @param {int} keyframeId Id of the given Keyframe
		 * @param {Object} scene Active scene of this animation
		 */
		onSelectKeyframe : function(object, keyframeId, sceneElements) {
			if (object != null && sceneElements[keyframeId] != null) {
				dojo.byId(this.selectKeyframe).style.display = "none";
				dojo.byId(this.changeKeyframe).style.display = "";
				this.selectedObject = object;
				this.keyframeId = keyframeId;
				this.sceneElements = sceneElements;
				
				if (keyframeId != 1 && keyframeId != 30 && keyframeId != 60) {
					var blub;
				}
	
				if (this.sceneElements[this.keyframeId] != null && this.sceneElements[this.keyframeId]["timingFunc"] != null) {
					this.readTimingFunc(this.sceneElements[this.keyframeId]["timingFunc"]);
				} else {
					this.updateTimingType("linear");
				}
			} else {
				dojo.byId(this.selectKeyframe).style.display = "";
				dojo.byId(this.changeKeyframe).style.display = "none";
				this.selectedObject = null;
				this.keyframeId -1;
				this.sceneElements = null;
			}
			
		},
		/**
		 * Updates the timing type to the given type and update the curve
		 */
		updateTimingType : function(type) {
			this.selectedType = type;
			this.keyframeTypeSelect.value = type;
			this.updatePointsForType(type);
			this.updateTextFields();
			this.drawBezier();
		},
		/**
		 * Sets the timing function of the current object 
		 */
		setTimingFunc:function() {
			if (this.keyframeId != -1 && this.sceneElements != null && this.sceneElements[this.keyframeId] != null) {
				if (this.selectedType == "custom") {
					// save the cubic bezier function
					this.sceneElements[this.keyframeId]["timingFunc"] = "cubic-bezier(" + this.pointsPercent.p1.x + "," + this.pointsPercent.p1.y + "," + this.pointsPercent.p2.x + "," + this.pointsPercent.p2.y + ")";
				} else if (this.selectedType == "linear") {
					// Linear is the default value
					delete this.sceneElements[this.keyframeId]["timingFunc"];
				} else if (this.selectedType != null) {
					this.sceneElements[this.keyframeId]["timingFunc"] = this.keyframeTypes[this.selectedType].text.toLowerCase();
				}
			}
		},
		/**
		 * Reads the timing function from an object 
		 */
		readTimingFunc : function(timingFunc) {
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

			if (timingKey != null) {
				this.updateTimingType(timingKey);
			}
			if (values != null) {
				this.pointsPercent.p1.x = parseFloat(values[0]);
				this.pointsPercent.p1.y = parseFloat(values[1]);
				this.pointsPercent.p2.x = parseFloat(values[2]);
				this.pointsPercent.p2.y = parseFloat(values[3]);
				// Change the coordinate system in curve 0/0 is bottom left in canvas thas pos is 0/1
				this.points.p1.x = this.pointsPercent.p1.x * this.keyframeCanvasSize;
				this.points.p1.y = (1 - this.pointsPercent.p1.y) * this.keyframeCanvasSize;
				this.points.p2.x = this.pointsPercent.p2.x * this.keyframeCanvasSize;
				this.points.p2.y = (1 - this.pointsPercent.p2.y) * this.keyframeCanvasSize;
				
				this.updateTextFields();
				this.drawBezier();
			}

		},
		/**
		 * Draws the bezier curve on the screen
		 */
		drawBezier : function() {
			this.ctx.clearRect(0, 0, this.keyframeCanvasSize, this.keyframeCanvasSize);

			this.ctx.lineWidth = 4;
			this.ctx.strokeStyle = "#000000";
			this.ctx.beginPath();
			this.ctx.moveTo(0, this.keyframeCanvasSize);
			this.ctx.bezierCurveTo(this.points.p1.x, this.points.p1.y, this.points.p2.x, this.points.p2.y, this.keyframeCanvasSize, 0);
			this.ctx.stroke();

			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = "#444444";
			this.ctx.beginPath();
			this.ctx.moveTo(this.points.p0.x, this.points.p0.y), this.ctx.lineTo(this.points.p1.x, this.points.p1.y);
			this.ctx.stroke();
			this.ctx.beginPath();
			this.ctx.moveTo(this.points.p3.x, this.points.p3.y), this.ctx.lineTo(this.points.p2.x, this.points.p2.y);
			this.ctx.stroke();

			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = "#444444";
			this.ctx.fillStyle = "rgba(180,180,180,0.4)";
			this.ctx.beginPath();
			this.ctx.arc(this.points.p1.x, this.points.p1.y, this.dragRadius, 0, 2 * Math.PI, true);
			this.ctx.fill();
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.arc(this.points.p2.x, this.points.p2.y, this.dragRadius, 0, 2 * Math.PI, true);
			this.ctx.fill();
			this.ctx.stroke();
		},
		/**
		 * Is called when the canvas is clicked and the curve should be changed
		 * @param {Point} point Point that could be selected
		 * @param {int} x Click pos
		 * @param {int} y Click pos
		 */
		hasSelected : function(point, x, y) {
			var dx = point.x - x;
			var dy = point.y - y;

			if ((dx * dx) + (dy * dy) < this.dragRadius * this.dragRadius) {
				return true;
			}
			return false;
		},
		/**
		 * Called when the canvas is clicked
		 * @param {Object} e
		 */
		onMouseDown : function(e) {
			if (this.hasSelected(this.points.p1, (e.offsetX != null) ? e.offsetX : e.layerX, (e.offsetY != null) ? e.offsetY : e.layerY)) {
				this.selectedBezier = true;
				this.dragPoint = "p1";
				this.updateTimingType("custom");
			} else if (this.hasSelected(this.points.p2, (e.offsetX != null) ? e.offsetX : e.layerX, (e.offsetY != null) ? e.offsetY : e.layerY)) {
				this.selectedBezier = true;
				this.dragPoint = "p2";
				this.updateTimingType("custom");
			} else {
				this.selectedBezier = true;
				this.dragPoint = null;
			}
			e.preventDefault();
		},
		/**
		 * Is Called when the mouse is moved on the screen
		 * @param {Object} e
		 */
		onMouseMove : function(e) {
			if (this.dragPoint != null) {
				this.points[this.dragPoint].x = (e.offsetX != null) ? e.offsetX : e.layerX;
				this.points[this.dragPoint].y = (e.offsetY != null) ? e.offsetY : e.layerY;
				this.pointsPercent[this.dragPoint].x = this.points[this.dragPoint].x / this.keyframeCanvasSize;
				this.pointsPercent[this.dragPoint].y = 1 - this.points[this.dragPoint].y / this.keyframeCanvasSize;
				this.drawBezier();

				dojo.byId(this.dragPoint + "X").value = "" + this.pointsPercent[this.dragPoint].x;
				dojo.byId(this.dragPoint + "Y").value = "" + this.pointsPercent[this.dragPoint].y;
			}
			e.preventDefault();
		},
		/**
		 * Is Called when the mouse is up on the canvas
		 * @param {Object} e
		 */
		onMouseUp : function(e) {
			if (this.selectedBezier) {
				this.dragPoint = null;
				this.setTimingFunc();
				this.selectedBezier = false;
				this.updateInbetweens();
			}
			e.preventDefault();
		}
	});

});

