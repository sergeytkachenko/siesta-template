/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.NthOfType', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    
    methods : {
        
        identify : function (target, root, maze) {
            var parentElement   = target.parentElement
            if (!parentElement) return null
            
            // SVG elements in IE does not have ".children"
            var siblings        = parentElement.children || parentElement.childNodes
            
            var counter         = 0
            
            var tagName         = target.tagName.toLowerCase()
            
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[ i ].tagName.toLowerCase() == tagName) {
                    counter++
                    
                    if (siblings[ i ] == target) break
                }
            }
            
            return {
                query           : ':nth-of-type(' + counter + ')',
                weight          : 1e6
            }
        }
    }
});
