/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Harness.Browser.UI.ElementHighlighter', {
    
    does        : [
        Siesta.Util.Role.CanCalculatePageScroll
    ],

    has : {
        window              : { required : true },
        containerEl         : null,
        
        el                  : null,
        
//        showSelectorText    : true,
        active              : false
    },

    methods : {
        
        initialize : function () {
            // for now we don't take into accoun the offset of the `containerEl`
            // so it is always assumed to be a <body> of the `this.window`
            this.containerEl    = this.window.document.body
        },
        

        start : function() {
            if (this.active) return
            
            var me              = this;
            var containerEl     = this.containerEl;
            
            var boxSizingStyle  = 'box-sizing: border-box;-moz-box-sizing: border-box;-ms-box-sizing: border-box;-webkit-box-sizing: border-box;';
            var innerEl         = document.createElement('div');

            var el = me.el      = document.createElement('div');

            el.className        = 'target-inspector-box';
            el.style.cssText    = 'position: absolute; left:0; top:0; pointer-events: none; z-index: 100000001; border: 2px solid red;transition-property: transform,border-color; transition-duration: 0.3s;';

            innerEl.style.cssText = 'border:1px solid;border-color:inherit;width : 13px; height : 13px;position : absolute;margin-top : -8px;margin-left : -8px;border-radius:19px;transition-property : transform;transition-duration : 0.3s;' + boxSizingStyle;
            innerEl.className   = 'target-inspector-coordinate';
            innerEl.innerHTML   = 
                '<div style="border-left: 1px solid;border-color:inherit;position: absolute;top: -3px;left: 5px;height: 6px;' + boxSizingStyle + '"></div>' +
                '<div style="border-left: 1px solid;border-color:inherit;position: absolute;bottom: -3px;left: 5px;height: 6px;' + boxSizingStyle + '"></div>' +
                '<div style="border-top: 1px solid;border-color:inherit;position: absolute;top: 5px;left: -3px;width: 6px;' + boxSizingStyle + '"></div>' +
                '<div style="border-top: 1px solid;border-color:inherit;position: absolute;top: 5px;right: -3px;width: 6px;' + boxSizingStyle + '"></div>';

            el.appendChild(innerEl);

            // ].concat(this.showSelectorText ? {
            //     tag    : 'a',
            //     cls    : 'target-inspector-label',
            //     target : '_blank'
            // } : [])
            // }

            containerEl.appendChild(el);

            this.active         = true;
        },

        
        getIndicatorEl : function () {
            return this.el;
        },

        
        stop : function (suppressEvent) {
            if (!this.active) return;

            this.active     = false;

            this.el.parentElement.removeChild(this.el);
            this.el         = null
        },
        

        // `offset` is expected to be already "normalized" to an array with 2 numbers 
        highlightTarget : function (node, offset/*, content*/) {
            if (!this.active) this.start();
            
            var boxStyle    = this.el.style;

            if (node) {
                var rect        = node.getBoundingClientRect();
                
                var left        = this.viewportXtoPageX(rect.left - 2 /*+ offsets[ 0 ]*/, this.window)
                var top         = this.viewportYtoPageY(rect.top - 2 /*+ offsets[ 1 ]*/, this.window)
                
                var width       = (rect.width || this.getCssWidth(node)) + 2
                var height      = (rect.height || this.getCssHeight(node)) + 2

                // Regular getWidth/getHeight doesn't work if another iframe is on the page
                boxStyle.setProperty('transform', 'translate(' + left + 'px,' + top + 'px)')
                boxStyle.width              = width + 'px';
                boxStyle.height             = height + 'px';
                boxStyle[ 'border-color' ]  = 'red';

//                if (this.showSelectorText && content) {
//                    this.updateHighlightContent(content);
//                }
                
                var crosshair       = this.el.firstChild;
    
                if (offset) {
                    crosshair.style.setProperty('display', 'block');
                    crosshair.style.setProperty('transform', 'translate(' + offset[ 0 ] + 'px,' + offset[ 1 ] + 'px)')
                } else {
                    crosshair.style.setProperty('display', 'none');
                }
            } else {
                // boxStyle.display   = 'none'
                
                boxStyle[ 'border-color' ] = '#ddd';
            }
        },
        
        
        getCssWidth : function (node) {
            var cssValue    = node.style.width
            
            return Number(cssValue.substring(0, cssValue.length - 2))
        },
        

        getCssHeight : function (node) {
            var cssValue    = node.style.height
            
            return Number(cssValue.substring(0, cssValue.length - 2))
        }
        
//        ,
//        getOffsets : function (node) {
//            var targetDoc       = this.window.document;
//            var offsets         = [ 0, 0 ]
//
//            if (node.ownerDocument !== targetDoc) {
//                var innerFrame  = (node.ownerDocument.parentWindow || node.ownerDocument.defaultView).frameElement;
//                var rect        = innerFrame.getBoundingClientRect();
//                var offsets     = [ rect.left, rec.top ];
//
//                offsets[ 0 ]    -= node.ownerDocument.body.scrollLeft;
//                offsets[ 1 ]    -= node.ownerDocument.body.scrollTop;
//            }
//
//            return offsets;
//        }
    }
});