/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.ExtJSComponentQueryFinder.Identifier.XType', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    does        : [
        Ariadne.ExtJSComponentQueryFinder.Role.ExtJSComponentHelper
    ],
    
    methods : {
        
        identify : function (cmp, root, maze) {
            var xtype       = this.getComponentXType(cmp)
            
            return [
                {
                    query           : xtype,
                    leading         : true 
                },
                {
                    query           : xtype + '(true)',
                    leading         : true,
                    weight          : 1010
                }
            ]
        }
    }
});
