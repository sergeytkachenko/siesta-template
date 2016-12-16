/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.ExtJSComponentQueryFinder.Identifier.DirectChild', {
    
    isa         : Ariadne.ExtJSComponentQueryFinder.Identifier.NthChild,
    
    
    methods : {
        
        identify : function (cmp, root, maze) {
            var container       = this.finder.getParent(cmp)
            
            if ((!container || container == root) && root.query) {
                var xtype                       = this.getComponentXType(cmp)
                var ownXtype                    = this.getComponentOwnXType(cmp)
                
                var xtypeSegment                = ownXtype ? ownXtype + '(true)' : xtype
                
                var allRootComponentsOfType     = root.query(xtypeSegment + ':root')
                var index                       = allRootComponentsOfType.indexOf(cmp)
    
                if (index >= 0) 
                    return {
                        query           : xtypeSegment + ':root(' + (index + 1) + ')',
                        weight          : 1e7
                    }
            } else {
                var segment     = this.SUPERARG(arguments)
                
                if (segment) segment.child = true
                
                return segment
            }
        }
    }
});
