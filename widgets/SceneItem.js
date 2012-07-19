require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "dojo/text!./widgets/templates/sceneitem.html", "dojo/_base/json"], function(declare, _Widget, _Templated, script, domConstruct, template) {

	return declare("widgets.SceneItem", [_Widget, _Templated], {
		templateString : template,
		radioBtnNode:null,
		name:"",

		postCreate : function() {
			//dojo.subscribe("/animtimelinewidget/selectKeyframe", this, "onSelectKeyframe");
		},
		startup : function() {
			this.radioBtnNode = dojo.query(".radioBtn", this.domNode)[0];
			this.sceneNameNode = dojo.query(".sceneName", this.domNode)[0];
			this.deleteSceneNode = dojo.query(".deleteScene", this.domNode)[0];
            dojo.connect(this.radioBtnNode, "onchange", this, this.changeSelection);
            dojo.connect(this.deleteSceneNode, "click", this, this.deleteScene);
		},
		changeSelection:function(e) {
			if (e != null && e.target != null && e.target.checked) {
				dojo.publish("/sceneitem/activatescene", [this.sceneNameNode.innerHTML]);
			}
		},
		deleteScene: function() {
			dojo.publish("/sceneitem/deletescene", [this.sceneNameNode.innerHTML]);
		},
		/**
		 * Sets the current SceneItem selected
		 * @param {Object} selected
		 */
		setSelected:function(selected) {
			this.radioBtnNode.checked = selected;
		}
	});

});

