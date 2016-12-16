/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Ariadne.DomQueryFinder.TreeWalker', {
    
    methods         : {
        
        getParent   : function (el) {
            return el.parentNode
        },
        
        
        contains : function (parentEl, childEl) {
            if (parentEl.contains)  return parentEl.contains(childEl) 
            
            // SVG elements in IE does not have "contains" method
            if (parentEl.compareDocumentPosition) 
                return parentEl === childEl || Boolean(parentEl.compareDocumentPosition(childEl) & 16)
            
            throw new Error("Can't determine `contains` status")
        }
    }
});
