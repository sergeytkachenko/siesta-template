/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.ExtJSComponentQueryFinder.Identifier.NthChild', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    does        : [
        Ariadne.ExtJSComponentQueryFinder.Role.ExtJSComponentHelper
    ],
    
    methods : {
        
        identify : function (cmp, root, maze) {
            var container       = this.finder.getParent(cmp)
            
            if (!container || container == root) return null
            
            if (!container.items) return null
            
            var index           = container.items.indexOf(cmp)
            
            if (index == -1) return null
            
            return {
                query           : ':nth-child(' + (index + 1) + ')',
                weight          : 1e6
            }
        }
    }
});
