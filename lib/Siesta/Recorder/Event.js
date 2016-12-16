/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
!function () {
    
var ID      = 1

Class('Siesta.Recorder.Event', {
    
    has : {
        id                  : function () { return ID++ },

        type                : null,

        // Use now instead of event timestamp Firefox / Chrome doesn't have same or 
        // stable timeStamp implementation (switched to DOMHighResTimeStamp in FF 39, Chrome 49)
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1186218
        // https://googlechrome.github.io/samples/event-timestamp/index.html
        timestamp           : function() {
            return Date.now();
        },

        // Alt, ctrl, meta, shift keys
        options             : null,
        
        // pageX and pageY - page coordinates
        x                   : null,
        y                   : null,
        
        target              : null,
        
        charCode            : null,
        keyCode             : null,
        
        button              : null,

        rawEvent            : null
    },
    
    
    methods : {
    },
    
    
    my : {
        has : {
            HOST            : null
        },
        
        methods : {
            
            fromDomEvent : function (e) {
                var options     = {}

                ;[ 'altKey', 'ctrlKey', 'metaKey', 'shiftKey' ].forEach(function (id) {
                    if (e[ id ]) options[ id ] = true;
                });
                
                var target          = e.target
                
                var config          = {
                    type            : e.type,
                    target          : target,
                    options         : options,
                    rawEvent        : e
                }
                
                if (e.type.match(/^key/)) {
                    config.charCode = e.charCode || e.keyCode;
                    config.keyCode  = e.keyCode;
                } else if (typeof e.clientX === 'number') {
                    var ownerDoc    = target && target.ownerDocument
                    
                    // Overcomplicated due to IE9
                    var docEl       = ownerDoc && ownerDoc.documentElement;
                    var bodyEl      = ownerDoc && ownerDoc.body;
                                                            //Chrome              Firefox
                    var pageX       = bodyEl ? e.clientX + (bodyEl.scrollLeft || docEl.scrollLeft) : e.pageX;
                    var pageY       = bodyEl ? e.clientY + (bodyEl.scrollTop || docEl.scrollTop) : e.pageY;

                    config.x        = pageX;
                    config.y        = pageY;
    
                    config.button   = e.button;
                }
                
                return new this.HOST(config)
            }
        }
    }

});

}();