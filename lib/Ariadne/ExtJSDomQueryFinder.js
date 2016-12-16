/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.ExtJSDomQueryFinder', {
    
    isa         : Ariadne.DomQueryFinder,
    
    has         : {
    },

    methods : {
        
        initIdentifiers : function () {
            this.addIdentifier(new Ariadne.ExtJSDomQueryFinder.Identifier.Id({
                shouldIgnoreDomElementId    : this.shouldIgnoreDomElementId,
                uniqueDomNodeProperty       : this.uniqueDomNodeProperty,
                
                finder      : this,
                priority    : 1000000
            }))
            
            this.addIdentifier(new Ariadne.ExtJSDomQueryFinder.Identifier.CssClass({
                finder      : this,
                priority    : 100000
            }))
            
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.Contains({
                finder      : this,
                priority    : 10000
            }))
            
            this.addIdentifier(new Ariadne.ExtJSDomQueryFinder.Identifier.AttributeValue({
                finder      : this,
                priority    : 1000
            }))
            
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.TagName({
                finder      : this,
                priority    : 100
            }))
            
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.NthOfType({
                finder      : this,
                priority    : 10
            }))
            
            this.directChildIdentifier = new Ariadne.DomQueryFinder.Identifier.DirectChild({ finder : this })
        },
        
        
        findQueries : function (target, root, options) {
            if (target && target.dom && target.dom.tagName) target = target.dom
            
            return this.SUPER(target, root, options)
        }
    }
});
