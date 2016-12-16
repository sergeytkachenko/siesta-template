/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.TagName', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    
    methods : {
        
        identify : function (target, root, maze) {
            var doc         = target.ownerDocument
            
            // this is a special case when target is <body> or <html> itself 
            var isUnique    = (!maze.nodes.length || target == maze.nodes[ 0 ].el) && (target == doc.body || target == doc.documentElement) 
            
            return {
                query           : target.tagName.toLowerCase(),
                leading         : true,
                weight          : isUnique ? 900 : 1000
            }
        }
    }
});
