HTML5 Animator
==============

This is a work in progress of my Animation System for HTML5. This editor allows creating HTML5 animations that can be displayed on different platforms. Supported platforms so far, Mozilla Firefox and webkit based browsers.
The HTML5 Animator consists of two components. On the one hand, the editor itself, where the animations can be created and also an engine that plays the created animations. The engine makes sure that the animations run on most platforms.
If you encounter questions or problems, while using the editor, please let me know in order to improve the functionality further.

Engine
------
The animations are created and displayed by an engine.
### AnimEn
The animation engine loads the animations and displays them.
### Core
The Core is the extended AnimEn and already has a default animation that will be loaded and played.
### DisplayObject
This is a simple object that can be shown on the screen. It can also serve as container for other objects.
### Sprite
A Sprite is an extended DisplayObject, which can display an image.
### AnimObject
This is an extended DisplayObject that can save animations of child objects.
### Resource Manager
The Resource Manager is designed to manage the images to be displayed
