/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Ariadne.DomQueryFinder.Role.DomHelper', {

    does        : [
        Siesta.Util.Role.CanGetType    
    ],

    methods : {
        
        ignoreCssClass : function (cls, dom) {
            return false
        },
        
        
        getCssClasses : function (dom) {
            // `className` will be a "[object SVGAnimatedString]" value for SVG elements
            var classes             = this.typeOf(dom.className) == 'String' ? dom.className.trim() : ''
            var significantClasses  = []
            var index               = {}

            classes                 = classes && classes.split(/\s+/) || [];

            for (var i = 0; i < classes.length; i++) {
                var cssClass            = classes[ i ]
                
                if (!index[ cssClass ]) {
                    if (!this.ignoreCssClass(cssClass, dom)) significantClasses.push(cssClass)
                    
                    index[ cssClass ]   = true
                }
            }
            
            return significantClasses
        },
        
        
        escapeDomSelector : function (selector, asId) {
            if (asId) return Sizzle.escape(selector)
            
            return Sizzle.escape("L" + selector).substring(1).replace(/\\ /g, ' ')
        },
        
        
        unEscapeDomSelector : function (selector) {
            return Sizzle.unescape(selector)
        }
    }
});
