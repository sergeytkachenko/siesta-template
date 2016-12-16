/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.Role.CanRecordMouseMoveOnIdle

A mixin, providing the feature of recording the "moveCursorTo" action, when mouse is idle
at some point for {@link #idleTimeout} time.

This feature can be enabled/disabled with the {@link recordMouseMoveOnIdle} config option.

*/
Role('Siesta.Recorder.Role.CanRecordMouseMoveOnIdle', {

    has : {
        /**
         * @cfg {Boolean} idleTimeout The amount of time for mouse cursor to be idle, after which the
         * `moveCursorTo` action will be recorded with the target of current cursor position.
         */
        idleTimeout             : 3000,
        
        /**
         * @cfg {Boolean} recordMouseMoveOnIdle Set this option to `true` to enable recording of `moveCursorTo`
         * action, when mouse is idle at some point for certain amount of time ({@link #idleTimeout}) 
         */
        recordMouseMoveOnIdle   : true,
        
        idleMouseMoveThrottler  : null
    },


    override : {
        
        initialize : function () {
            if (this.recordMouseMoveOnIdle) this.recordMouseMove = true
            
            this.SUPERARG(arguments)
            
            if (this.recordMouseMoveOnIdle) {
                this.idleMouseMoveThrottler     = new Siesta.Util.Throttler({
                    func            : this.onBodyMouseMoveIdle,
                    scope           : this,
                    
                    buffer          : this.idleTimeout
                })
                
                this.resetMouseMoveListener     = this.resetMouseMoveListener.bind(this);
            }
        },
        
        
        onDomEvent : function (e) {
            this.SUPERARG(arguments)

            // this "reset" will ensure that "onBodyMouseMove" handler will be called after "idleTimeout"
            // after any other dom event
            this.resetMouseMoveListener();
        },
        
        
        clear : function () {
            if (this.recordMouseMoveOnIdle) {
                this.resetMouseMoveListener()
            }
            
            this.SUPERARG(arguments)
        },


        onStart : function () {
            this.SUPERARG(arguments)
            
            var win     = this.window
            var doc     = win.document
            var body    = doc.body

            if (this.recordMouseMoveOnIdle) {
                body.addEventListener('mouseleave', this.resetMouseMoveListener)
            }
        },


        onStop : function () {
            this.SUPERARG(arguments)
            
            var win     = this.window
            var doc     = win.document
            var body    = doc.body
            
            if (this.recordMouseMoveOnIdle) {
                body.removeEventListener('mouseleave', this.resetMouseMoveListener)
                
                this.resetMouseMoveListener()
            }
        },


        processBodyMouseMove : function (e) {
            this.SUPERARG(arguments)
            
            if (this.recordMouseMoveOnIdle) {
                this.idleMouseMoveThrottler.tick(e)
            }
        }
    },
    // eof `override`
    
    methods : {
        
        resetMouseMoveListener : function () {
            this.idleMouseMoveThrottler && this.idleMouseMoveThrottler.cancel()
        },
        
        
        onBodyMouseMoveIdle : function (e) {
            this.addMoveCursorAction(e);
        }
    }
});