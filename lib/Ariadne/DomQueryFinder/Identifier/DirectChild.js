/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.DirectChild', {
    
    isa         : Ariadne.DomQueryFinder.Identifier.NthOfType,
    
    
    methods : {
        
        identify : function (target, root, maze) {
            if (!target.parentElement || target.parentElement == root) return null
            
            var segment         = this.SUPERARG(arguments)
            
            segment.query       = target.tagName.toLowerCase() + segment.query
            segment.leading     = true
            segment.child       = true
            segment.weight      *= 10
            
            return segment
        }
    }
});
