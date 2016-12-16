/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.Role.CanRecordScroll

A mixin, providing the feature of recording the "scroll" event. This even occurs, when some element on the page,
or the page itself, is scrolled by user. Several consequent `scroll` events on the same element will be merged
into one `scrollTo` action.

*/
Role('Siesta.Recorder.Role.CanRecordScroll', {
    
    has : {
        /**
         * @cfg {Boolean} recordScroll Set this option to `true` to enable recording of `scroll` events
         */
        recordScroll        : false
    },

    override : {
        
        initialize : function () {
            var me = this;

            me.SUPERARG(arguments);

            me.onScrollEvent    = me.onScrollEvent.bind(me);
        },

        
        onStart : function () {
            this.SUPERARG(arguments);
            
            var win     = this.window;
            var doc     = win.document;

            // Observe scroll events
            if (this.recordScroll) {
                doc.addEventListener('scroll', this.onScrollEvent, true);
            }
        },

        
        onStop: function () {
            this.SUPERARG(arguments);
            
            var win     = this.window;
            var doc     = win.document;

            if (this.recordScroll) {
                doc.removeEventListener('scroll', this.onScrollEvent, true);
            }
        },
        
        
        onScrollEvent : function (scrollEvent) {
            var me      = this;
            var target  = scrollEvent.target;
            
            var win     = me.window
            var doc     = win.document
            
            var lastAction  = this.getLastAction()

            // note that "target" here is unchanged and can be a document
            if (lastAction && lastAction.action == 'scrollTo' && target == lastAction.sourceEvent.target) {
                // repeated scroll on the same target
                if (target === doc) target = doc.body;
                
                lastAction.value    = [ target.scrollLeft, target.scrollTop ]
                
                this.fireEvent('actionupdate', lastAction)
            } else {
                // scroll on the new target
                
                // page scroll events are fired with document as target, switch it to use body element
                if (target === doc) target = doc.body;
                
                var cursorPosition  = this.cursorPosition
                
                if (cursorPosition.length === 2) {
                    var viewportX       = this.pageXtoViewportX(cursorPosition[ 0 ], win)
                    var viewportY       = this.pageYtoViewportY(cursorPosition[ 1 ], win)
                    
                    // Ignore scroll if cursor is outside of scroll target
                    // we consider such scrolls as happened because of side-effect of some other user action
                    if (!this.isPointWithinElement(viewportX, viewportY, target)) return
                }
                
                this.addAction({
                    action          : 'scrollTo',
                    
                    target          : this.getPossibleTargets(scrollEvent, false, target),
                    value           : [ target.scrollLeft, target.scrollTop ],
    
                    sourceEvent     : Siesta.Recorder.Event.fromDomEvent(scrollEvent)
                })
            }
        }
    }
});