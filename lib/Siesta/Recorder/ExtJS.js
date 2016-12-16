/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.ExtJS

Ext JS specific recorder implementation

*/
Class('Siesta.Recorder.ExtJS', {
    isa     : Siesta.Recorder.Recorder,

    has : {
        extractorClass          : Siesta.Recorder.TargetExtractor.ExtJS,
        
        moveCursorToSelectors   : function () {
            return [
                // Can't access child menu items without first visiting each menu item hovered
                '.x-menu-item:not(.x-menu-item-separator)',
                
                // Column menu / resizing access
                '.x-column-header'     
            ];
        }
    },

    
    methods : {
        
        addMoveCursorAction : function (event) {
            // If something is being dragged and we're hovering over the drag target, choose moveCursorTo with coordinate
            if (event.target && this.closest(event.target, '[class*=-dd-drag-proxy]', 10)) {
                this.addAction({
                    action          : 'moveCursorTo',

                    target          : [{
                        type        : 'xy',
                        target      : [ event.x, event.y ]
                    }],

                    sourceEvent     : event,
                    options         : event.options
                })
            } else {
                this.SUPERARG(arguments)
            }
        }
    }
    // eof methods
});
