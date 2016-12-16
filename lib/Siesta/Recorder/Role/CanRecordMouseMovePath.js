/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.Role.CanRecordMouseMovePath

A mixin, providing the recording of mouse move path. This feature solves the problem of interacting
with various elements on the page, which appears only after the cursor hovers some other elements.
Typical example is the resize handler. It normally appears only after the cursor goes over the
border element of some UI component. So, to target the resize handler element in some action, we need
first to move cursor to the border element, otherwise resize handler remains invisible.

This recorder feature will make sure cursor goes through the same path as during user interaction,
triggering the same hover elements.

Mouse move path is collected in the form, recognized by the {@link Siesta.Test.Browser#moveCursorAlongPath} 
method and the `moveCursorAlongPath` action is created.

This feature can be enabled/disabled with the {@link #recordMouseMovePath} config option. It will disable
the {@link Siesta.Recorder.Recorder#recordPointsOfInterest recordPointsOfInterest} and 
{@link Siesta.Recorder.Recorder#recordMouseMoveOnIdle recordMouseMoveOnIdle} 
options, as it solves the same problem in more general way.

*/
Role('Siesta.Recorder.Role.CanRecordMouseMovePath', {
    
    has : {
        /**
         * @cfg {Boolean/String} recordMouseMovePath Set this option to `true` to enable recording of path, the user was 
         * moving the mouse. Be prepared, that this option will generate a lot of data in the playback script.
         * 
         * This option can be a `Boolean` value or a `String`. A string can be one of `coordinate` or `query`.
         * The `coordinate` will use page coordinates for mouse move path, the `query` - normal Siesta queries
         * (composite, component and CSS) plus offset. The boolean value `true` corresponds to string `coordinate`.
         * 
         * Enabling this option will disable the {@link Siesta.Recorder.Recorder#recordPointsOfInterest recordPointsOfInterest} 
         * and {@link Siesta.Recorder.Recorder#recordMouseMoveOnIdle recordMouseMoveOnIdle} options.
         */
        recordMouseMovePath     : false,
        
        lastMouseOutTarget      : null
    },
    
    
    after : {
        
        onStart : function () {
            this.lastMouseOutTarget             = null
        },
        
        
        onStop : function () {
            this.lastMouseOutTarget             = null
        }
    },


    override : {
        
        initialize : function () {
            if (this.recordMouseMovePath) {
                this.recordPointsOfInterest     = false
                this.recordMouseMoveOnIdle      = false
            }
            
            this.SUPERARG(arguments)
            
            if (this.recordMouseMovePath === true) this.recordMouseMovePath = 'coordinate'
        },
        
        
        processBodyMouseOver : function (e) {
            this.SUPERARG(arguments)
            
            // both the `mouseout` and `mouseover` events are fired in pairs, for the same point on the screen
            // but sometimes, only the `mouseover` can be fired (when mouse comes from the outside of the
            // browser window)
            // `mouseout` is fired first, so we don't need to record `mouseover` if we've already processed
            // `mouseout`
            if (this.recordMouseMovePath && e.target != this.lastMouseOutTarget) {
                this.addMoveCursorAction(e, null, this.recordMouseMovePath == 'coordinate' || this.mouseState == 'down')
            }
            
            this.lastMouseOutTarget     = null
        },
        
        
        processBodyMouseOut : function (e) {
            this.SUPERARG(arguments)
            
            this.lastMouseOutTarget     = e.relatedTarget
            
            if (this.recordMouseMovePath) 
                this.addMoveCursorAction(e, e.relatedTarget, this.recordMouseMovePath == 'coordinate' || this.mouseState == 'down')
        }
    }
    // eof `override`
});