/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.Contains', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    does        : Ariadne.DomQueryFinder.Role.DomHelper,
    
    has         : {
        maxCharsForContainsSelector     : 30
    },
    
    methods : {
        
        identify : function (target, root, maze) {
            var attributes      = this.attributes
            var segments        = []
            
            // SVG elements in IE does not have ".children"
            var children        = target.children || target.childNodes
            
            if (children.length == 0 || (children.length == 1 && !children[ 0 ].innerHTML)) {
                var text        = target.textContent.trim()
                
                if (text.length > 1)
                    if (text.length <= this.maxCharsForContainsSelector)
                        return {
                            query       : ':textEquals(' + this.escapeDomSelector(text) + ')'
                        }
                    else
                        return {
                            query       : ':contains(' + this.escapeDomSelector(text.substr(0, this.maxCharsForContainsSelector)) + ')'
                        }
            }
            
            return null
        }
    }
});
