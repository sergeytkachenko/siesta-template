/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Util.Role.Dom', {
    
    does        : [
        Siesta.Util.Role.CanCalculatePageScroll
    ],

    has : {
        doesNotIncludeMarginInBodyOffset : false
    },
    
    methods : {
        
        isCrossOriginWindow : function (win) {
            try {
                var doc     = win.document;
            } catch (e) { 
                return true
            }
            
            // Safari doesn't throw exception when trying to access x-domain frames
            return !doc
        },
        

        closest : function (elem, selector, maxLevels) {
            maxLevels = maxLevels || Number.MAX_VALUE;

            var docEl = elem.ownerDocument.documentElement;

            // Get closest match
            for (var i = 0; i < maxLevels && elem && elem !== docEl; elem = elem.parentNode ){
                if (Sizzle.matchesSelector(elem, selector)) {
                    return elem;
                }

                i++;
            }

            return false;
        },

        
        contains : function (parentEl, childEl) {
            if (!parentEl) return false
            
            if (parentEl.contains)  return parentEl.contains(childEl) 
            
            // SVG elements in IE does not have "contains" method
            if (parentEl.compareDocumentPosition) 
                return parentEl === childEl || Boolean(parentEl.compareDocumentPosition(childEl) & 16)
            
            throw new Error("Can't determine `contains` status")
        },

        
        is : function (node, selector) {
            return Sizzle.matchesSelector(node, selector);
        },

        
        // returns { left : Number, top : Number } object in page coordinates
        offset : function (elem) {
            if (!elem) return null
            
            var doc     = elem.ownerDocument
            if (!doc) return null

            if (elem === doc.body) return this.bodyOffset(elem);
            
            var box     = elem.getBoundingClientRect()
            
            var win     = doc.defaultView || doc.parentWindow
            
            return box ? { 
                left    : this.viewportXtoPageX(Math.floor(box.left), win), 
                top     : this.viewportYtoPageY(Math.floor(box.top), win) 
            } : {
                left    : 0,
                top     : 0 
            }
        },

        
        bodyOffset: function (body) {
            var top     = body.offsetTop,
                left    = body.offsetLeft;

            this.initializeOffset();

            if (this.doesNotIncludeMarginInBodyOffset) {
                var style = getComputedStyle(body);

                top     += parseFloat(style.marginTop) || 0;
                left    += parseFloat(style.marginLeft) || 0;
            }

            return { top: top, left: left };
        },

        
        initializeOffset: function () {
            var body        = document.body, 
                container   = document.createElement("div"), 
                bodyMarginTop = parseFloat(getComputedStyle(body).marginTop) || 0,
                html        = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

            var styles      = { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" };

            for (var o in styles) {
                container.style[ o ] = styles[ o ];
            }

            container.innerHTML     = html;
            
            body.insertBefore(container, body.firstChild);
            
            var innerDiv            = container.firstChild;
            var checkDiv            = innerDiv.firstChild;
            var td                  = innerDiv.nextSibling.firstChild.firstChild;

            checkDiv.style.position = "fixed";
            checkDiv.style.top      = "20px";
            checkDiv.style.position = checkDiv.style.top = "";

            innerDiv.style.overflow = "hidden";
            innerDiv.style.position = "relative";

            this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

            body.removeChild(container);
            
            this.initializeOffset   = function () {};
        },

        
        getElementWidth : function (el) {
            return el.getBoundingClientRect().width;
        },


        getElementHeight : function (el) {
            return el.getBoundingClientRect().height;
        },
        
        
        getWindowSize : function (win) {
            var doc         = win.document
            
            return {
                width       : win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth,
                height      : win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight
            }
        },
        
        
        isPointWithinElement : function (x, y, el) {
            var rect = el.getBoundingClientRect();
            
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        },
        
        
        isElementReachableAt : function (el, pageX, pageY, allowChild) {
            allowChild      = allowChild !== false
            
            var doc         = el.ownerDocument
            var win         = doc.defaultView || doc.parentWindow
            var foundEl     = doc.elementFromPoint(this.pageXtoViewportX(pageX, win), this.pageYtoViewportY(pageY, win))

            return foundEl && (foundEl === el || allowChild && this.contains(el, foundEl))
        },

        
        isElementReachableAtCenter : function (el, allowChild) {
            allowChild      = allowChild !== false
            
            var offsets     = this.offset(el);

            return this.isElementReachableAt(
                el, 
                offsets.left + (this.getElementWidth(el) / 2), 
                offsets.top + (this.getElementHeight(el) / 2),
                allowChild
            );
        }
    }
})
