/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.AttributeValue', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    does        : Ariadne.DomQueryFinder.Role.DomHelper,
    
    has         : {
        // an array of attribute names, which can be used for matching
        attributes                  : function () {
            return [
                'name',
                'title'
            ]
        }
    },
    
    methods : {
        
        initialize : function (cfg) {
            this.attributes     = this.mergeArrayAttributeFromClassHierarchy('attributes', cfg)
        },
        
        
        ignoreAttribute : function (target, attributeName) {
            return false
        },
        
        
        identify : function (target, root, maze) {
            var attributes      = this.attributes
            var segments        = []
            
            for (var i = 0; i < attributes.length; i++) {
                var attribute   = attributes[ i ]
                
                if (target.hasAttribute(attribute) && !this.ignoreAttribute(target, attribute))
                    segments.push("[" + attribute + "='" + this.escapeDomSelector(target.getAttribute(attribute)) + "']")
            }
                    
            return segments
        }
    }
});
