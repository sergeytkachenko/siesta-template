/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Recorder.Role.CanRecordMouseDownUp', {
    
    has : {
        mouseState              : 'up',
        
        eventNameMap            : { lazy : 'this.buildEventNameMap' },
        
        needToCaptureInitialMouseState  : true
    },


    override : {
        
        initialize : function () {
            this.SUPERARG(arguments)
            
            this.onDocMouseDown         = this.safeBind(this.onDocMouseDown)
            this.onDocMouseUp           = this.safeBind(this.onDocMouseUp)
            
            this.onInitialMouseMove     = this.safeBind(this.onInitialMouseMove)
        },


        onStart : function () {
            this.SUPERARG(arguments);
            
            var eventNameMap            = this.getEventNameMap()
            
            var win     = this.window;
            var doc     = win.document;

            doc.addEventListener(eventNameMap.mousedown, this.onDocMouseDown, true);
            doc.addEventListener(eventNameMap.mouseup, this.onDocMouseUp, true);
            
            doc.body.addEventListener('mousemove', this.onInitialMouseMove, true)
            
            this.needToCaptureInitialMouseState = true
        },


        onStop : function () {
            this.SUPERARG(arguments);
            
            var eventNameMap            = this.getEventNameMap()
            
            var win     = this.window;
            var doc     = win.document;

            doc.removeEventListener(eventNameMap.mousedown, this.onDocMouseDown, true);
            doc.removeEventListener(eventNameMap.mouseup, this.onDocMouseUp, true);
            
            if (this.needToCaptureInitialMouseState) this.onInitialStateCaptured()
        }
    },
    
    methods : {
        
        onInitialMouseMove : function (e) {
            if (e.buttons != null && (e.buttons & 1)) this.mouseState = 'down'
            
            this.onInitialStateCaptured()
        },
        
        
        onInitialStateCaptured : function () {
            this.window.document.body.removeEventListener('mousemove', this.onInitialMouseMove, true)
            
            this.needToCaptureInitialMouseState = false
        },
        
        
        onDocMouseDown : function (e) {
            // Skip test playback events and mouse moves in frames
            if ((this.ignoreSynthetic && e.synthetic) || e.target.ownerDocument !== this.window.document) return;
            
            if (this.needToCaptureInitialMouseState) this.onInitialStateCaptured()
            
            this.processDocMouseDown(e)
        },
        
        
        processDocMouseDown : function (e) {
            this.mouseState     = 'down'
        },
        
        
        onDocMouseUp : function (e) {
            // Skip test playback events and mouse moves in frames
            if ((this.ignoreSynthetic && e.synthetic) || e.target.ownerDocument !== this.window.document) return;
            
            if (this.needToCaptureInitialMouseState) this.onInitialStateCaptured()
            
            this.processDocMouseUp(e)
        },
        
        
        processDocMouseUp : function (e) {
            this.mouseState     = 'up'
        },
        
        
        isPointerDownEvent : function (event) {
            return /(ms)?(pointer|mouse)down/i.test(event.type)
        },

        
        isPointerUpEvent : function (event) {
            return /(ms)?(pointer|mouse)up/i.test(event.type)
        },
        
        
        buildEventNameMap : function () {
            var events  = {}
            
            if (window.MSPointerEvent) {
                events.mousedown    = 'MSPointerDown'
                events.mouseup      = 'MSPointerUp'
            // quick silence for test failures, in the long run
            // need to propery implement event fireing with "pointer" events
            } else if (window.PointerEvent && !bowser.chrome) { 
                events.mousedown    = 'pointerdown'
                events.mouseup      = 'pointerup'
            } else { 
                events.mousedown    = 'mousedown'
                events.mouseup      = 'mouseup'
            }
                
            return events
        }
    }
    // eof `override`
});