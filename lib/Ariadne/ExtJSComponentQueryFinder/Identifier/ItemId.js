/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.ExtJSComponentQueryFinder.Identifier.ItemId', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    methods : {
        
        identify : function (target, root, maze) {
            var itemId      = target.itemId
            
            if (itemId)
                return {
                    query           : '#' + itemId,
                    weight          : -1000
                }
        }
    }
});
