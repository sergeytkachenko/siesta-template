/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.Role.CanRecordWindowResize

A mixin with providing recording for window resize events.

*/
Role('Siesta.Recorder.Role.CanRecordWindowResize', {
    
    requires    : [
        'getWindowSize'
    ],
    
    does        : [
        Siesta.Recorder.Role.CanSwallowException
    ],

    has : {
        /**
         * @cfg {Boolean} recordWindowResize Set this option to `true` to enable recording of window resize events
         */
        recordWindowResize          : true,
        
        /**
         * @cfg {Boolean} recordInitialWindowSize Set this option to `true` to record the single `setWindowSize` action
         * at first launch of the recorder.
         */
        recordInitialWindowSize     : false
    },


    override : {

        initialize : function () {
            this.SUPERARG(arguments)
            
            this.onWindowResize        = this.safeBind(this.onWindowResize);
        },

        
        onStart : function () {
            this.SUPERARG(arguments)
            
            var win             = this.window
                
            if (this.recordWindowResize) win.addEventListener('resize', this.onWindowResize);
            
            if (this.recordInitialWindowSize) {
                // don't record the size on following start/stop
                this.recordInitialWindowSize = false
                
                var size        = this.getWindowSize(this.window)
                
                this.addAction({
                    action          : 'setWindowSize',
                    value           : [ size.width, size.height ]
                })
            }
        },

        
        onStop : function () {
            this.SUPERARG(arguments)
            
            var win             = this.window
                
            if (this.recordWindowResize) win.removeEventListener('resize', this.onWindowResize);
        }
    },
    
    
    methods : {
        
        onWindowResize : function (nativeEvent) {
            var size            = this.getWindowSize(this.window)
            
            var lastAction      = this.getLastAction()

            // note that "target" here is unchanged and can be a document
            if (lastAction && lastAction.action == 'setWindowSize') {
                
                lastAction.value    = [ size.width, size.height ]
                
                this.fireEvent('actionupdate', lastAction)
            } else {
                this.addAction({
                    action          : 'setWindowSize',
                    value           : [ size.width, size.height ],
                    sourceEvent     : Siesta.Recorder.Event.fromDomEvent(nativeEvent)
                })
            }
        }
    }
    // eof methods
});