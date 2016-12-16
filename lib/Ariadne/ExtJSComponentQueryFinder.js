/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

*/
Class('Ariadne.ExtJSComponentQueryFinder', {
    
    isa         : Ariadne.QueryFinder,
    
    does        : [
        Siesta.Util.Role.CanInstallCQRootPseudo,
        Ariadne.ExtJSComponentQueryFinder.TreeWalker,
        Ariadne.ExtJSDomQueryFinder.Role.ExtJSHelper
    ],

    has         : {
        Ext                         : null,
        
        uniqueComponentProperty     : null
    },

    methods : {
        
        setExtByDomElement : function (dom) {
            this.Ext        = this.getExtByDomElement(dom)
        },
        
        
        setExt : function (Ext) {
            this.Ext        = Ext
        },
        
        
        initRecognizers : function () {
        },
        
        
        initIdentifiers : function () {
            this.addIdentifier(new Ariadne.ExtJSComponentQueryFinder.Identifier.Id({
                finder      : this,
                priority    : 10000
            }))
            
            this.addIdentifier(new Ariadne.ExtJSComponentQueryFinder.Identifier.ItemId({
                finder      : this,
                priority    : 10000
            }))
            
            this.addIdentifier(new Ariadne.ExtJSComponentQueryFinder.Identifier.PropertyValue({
                properties  : this.uniqueComponentProperty,
                finder      : this,
                priority    : 1000
            }))
            
            this.addIdentifier(new Ariadne.ExtJSComponentQueryFinder.Identifier.XType({
                finder      : this,
                priority    : 100
            }))
            
            this.addIdentifier(new Ariadne.ExtJSComponentQueryFinder.Identifier.NthChild({
                finder      : this,
                priority    : 10
            }))
            
            this.directChildIdentifier = new Ariadne.ExtJSComponentQueryFinder.Identifier.DirectChild({ finder : this })
        },
        
        
        doQuery : function (query, root) {
            var CQ      = this.Ext.ComponentQuery
            
            if (root == CQ) root = null
            
            return CQ.query(query, root)
        },
        
        
        findQueries : function (target, root, options) {
            if (!target) throw new Error("No target")
            
            var Ext     = this.Ext
            
            if (!Ext || !Ext.ComponentQuery) return []
            
            var CQ      = Ext.ComponentQuery
            
            this.installRootPseudoCQ(Ext)
            if (!root) root = CQ
            
            var parent  = this.getParent(target)
            
            // special case, for boundlists within comboboxes - we want to identify
            // combobox first, and then - boundlist within it
            if (parent != root && !parent.items) {
                var parentQueries   = this.SUPER(parent, root, options)
                var childQueries    = this.SUPER(target, parent, options)
                
                if (parentQueries.length && childQueries.length) {
                    var result          = []
                    
                    parentQueries.forEach(function (parentQuery) {
                        childQueries.forEach(function (childQuery) {
                            result.push(parentQuery + ' ' + childQuery)
                        })
                    })
                    
                    return result
                }
            }
            
            return this.SUPER(target, root, options)
        }
    }
});
