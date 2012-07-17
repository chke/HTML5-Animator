require(["dojo/_base/declare", "dijit/_Widget", "dijit/_Templated", "dojo/io/script", "dojo/dom-construct", "dojo/text!./widgets/templates/scenewidget.html", "widgets/SceneItem", "engine/util/Storage", "dojo/_base/json"], function(declare, _Widget, _Templated, script, domConstruct, template, SceneItem, Storage) {

	return declare("widgets.SceneWidget", [_Widget, _Templated], {
		templateString : template,
		activeSceneNode: null,
		sceneItemsNode:null,
		addSceneNode:null,
		scenes:{},
		sceneItems:{},
		stageInitialized: false,

		postCreate : function() {
			dojo.subscribe("/animwidget/initStage", this, "onInitStage");
			dojo.subscribe("/sceneitem/activatescene", this, "onActivateScene");
			dojo.create("link", {
				rel : "stylesheet",
				href : "./widgets/templates/css/scenewidget.css"
			}, dojo.query("head")[0]);
		},
		startup : function() {
			this.init();
			
            if (!this.stageInitialized) {
                dojo.publish("/animtimelinewidget/requestInitStage", []);
            }
		},
		/**
		 * Initializes the stage and creates the scenes 
		 */
		onInitStage:function(stage) {
			this.stageInitialized = true;
			this.findScenesInStageRec(stage);
			this.initScenes();
		},
		/**
		 * Is called when a scene should be selected 
		 */
		onActivateScene: function(selKey) {
			for(var key in this.sceneItems) {
				this.sceneItems[key].setSelected(false);
			}
			this.activeSceneNode.innerHTML = selKey;
			this.sceneItems[selKey].setSelected(true);
		},
		/**
		 * Initializes the scenes and displays the list 
		 */
		initScenes:function() {
			var defaultSet = false;
			
			var scene = Storage.getString("activeScene");
			
			if (this.scenes[scene] != null) {
				this.activeSceneNode.innerHTML = scene;
				defaultSet = true;
			} else if (this.scenes["defaultAnim"] != null) {
				this.activeSceneNode.innerHTML = "defaultAnim";
				defaultSet = true;
			}
			
			for(var key in this.scenes) {
				
				this.sceneItems[key] = new widgets.SceneItem({"name":key});
		        
		        this.sceneItemsNode.appendChild(this.sceneItems[key].domNode);
		        
		        this.sceneItems[key].startup();
		        
		        if (!defaultSet) {
		        	scene = key;
					this.activeSceneNode.innerHTML = key;
					defaultSet = true;
				}
			}
			
			this.sceneItems[scene].setSelected(true);
		},
		findScenesInStageRec:function(displObj) {
			if (displObj != null) {
				if (displObj.animations != null) {
					this.findScenesInAnimation(displObj.animations);
				}
				for (var key in displObj.getChildren()) {
					this.findScenesInStageRec(displObj.getChildren()[key]);
				}
			}
		},
		findScenesInAnimation:function(anim) {
			for (var key in anim) {
				this.scenes[key] = true;
			}
		},
		/**
		 * Initializes the Scene Widget
		 */
		init : function() {
			this.activeSceneNode = dojo.byId("activeScene");
			this.sceneItemsNode = dojo.byId("sceneItems");
			
			
			this.addSceneNode = dojo.byId("addScene");
            dojo.connect(this.addSceneNode, "onclick", this, this.addScenePopup);
			
		},
		addScenePopup:function() {
			var newScene = window.prompt("Please enter the name of the new scene", "newScene");
            if (newScene !== null) {
            	if (this.scenes[newScene] != null) {
            		window.alert("The name of the scene you entered already exists");
            	} else {
            		this.addScene(newScene);
            	}
                
            }
		},
		/**
		 * Adds a new Scene to the Animation
		 * @param {Object} key Name of the scene
		 */
		addScene:function(key) {
			this.scenes[key] = true;
			
			this.sceneItems[key] = new widgets.SceneItem({"name":key});
        
	        this.sceneItemsNode.appendChild(this.sceneItems[key].domNode);
	        
	        this.sceneItems[key].startup();
		}
	});

});

