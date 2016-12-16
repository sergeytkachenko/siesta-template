/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**


*/
Class('Ariadne.DomQueryFinder', {
    
    isa         : Ariadne.QueryFinder,
    
    does        : Ariadne.DomQueryFinder.TreeWalker,

    has         : {
        uniqueDomNodeProperty       : null,
        
        shouldIgnoreDomElementId    : null
    },

    methods : {
        
        initRecognizers : function () {
        },
        
        
        initIdentifiers : function () {
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.Id({
                uniqueDomNodeProperty       : this.uniqueDomNodeProperty,
                shouldIgnoreDomElementId    : this.shouldIgnoreDomElementId,
                finder      : this,
                priority    : 10000
            }))
            
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.CssClass({
                finder      : this,
                priority    : 1000
            }))
            
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.Contains({
                finder      : this,
                priority    : 1000
            }))
            
            this.addIdentifier(new Ariadne.DomQueryFinder.Identifier.AttributeValue({
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
        
        
        doQuery : function (query, root) {
            if (/:contains\(/.test(query) || /:textEquals\(/.test(query) || /:nth-of-type\(\d/.test(query))
                return Sizzle(query, root)
            else
                return (root || document).querySelectorAll(query)
        },
        
        
        findQueries : function (target, root, options) {
            if (!target) throw new Error("No target")
            if (!root) root = target.ownerDocument
            
            return this.SUPER(target, root, options)
        }
    }
});
