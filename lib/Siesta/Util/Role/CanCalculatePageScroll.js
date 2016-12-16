/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Util.Role.CanCalculatePageScroll', {
    // also recognizes the "global" attribute
    
    methods : {
        
        getPageScrollX : function (win) {
            win                 = win || this.global
            var doc             = win.document
            
            return window.pageXOffset != null ? win.pageXOffset : doc.compatMode === "CSS1Compat" ? doc.documentElement.scrollLeft : doc.body ? doc.body.scrollLeft : 0
        },
        
        
        getPageScrollY : function (win) {
            win                 = win || this.global
            var doc             = win.document
            
            return window.pageYOffset != null ? win.pageYOffset : doc.compatMode === "CSS1Compat" ? doc.documentElement.scrollTop : doc.body ? doc.body.scrollTop : 0 
        },
        
        
        viewportXtoPageX : function (x, win) {
            win                 = win || this.global
            var docEl           = win.document.documentElement
            
            // seems the "docEl.clientLeft" thing is copied from jQuery, not sure what kind of
            // edge case it is supposed to solve
            return x + this.getPageScrollX(win) - docEl.clientLeft
        },
        
        
        viewportYtoPageY : function (y, win) {
            win                 = win || this.global
            var docEl           = win.document.documentElement
            
            // seems the "docEl.clientLeft" thing is copied from jQuery, not sure what kind of
            // edge case it is supposed to solve
            return y + this.getPageScrollY(win) - docEl.clientTop
        },
        
        
        pageXtoViewportX : function (x, win) {
            win                 = win || this.global
            var docEl           = win.document.documentElement
            
            // seems the "docEl.clientLeft" thing is copied from jQuery, not sure what kind of
            // edge case it is supposed to solve
            return x - this.getPageScrollX(win) + docEl.clientLeft
        },
        
        
        pageYtoViewportY : function (y, win) {
            win                 = win || this.global
            var docEl           = win.document.documentElement
            
            // seems the "docEl.clientLeft" thing is copied from jQuery, not sure what kind of
            // edge case it is supposed to solve
            return y - this.getPageScrollY(win) + docEl.clientTop
        }
    }
})
