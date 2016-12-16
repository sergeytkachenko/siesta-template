/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Ariadne.ExtJSComponentQueryFinder.Role.ExtJSComponentHelper', {
    
    does        : Ariadne.DomQueryFinder.Role.DomHelper,

    has : {
    },

    methods : {
        
        getComponentXType : function (cmp) {
            var xtype   = this.getComponentOwnXType(cmp)
            
            if (xtype) return xtype
            
            xtype       = cmp.getXTypes && cmp.getXTypes()
            
            if (!xtype) return null
            
            xtype       = xtype.split('/')
            
            return xtype[ xtype.length - 1 ]
        },
        
        // might be not available if component does not define the "alias" property in "widget" namespace
        getComponentOwnXType : function (cmp) {
            return (cmp.getXType && cmp.getXType()) || cmp.xtype || cmp.xtypes[ 0 ]
        },
        
        
        escapeCQSelector : function (selector) {
             return this.escapeDomSelector(selector)
        }
    }
});
