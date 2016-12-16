/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Util.Role.CanInstallCQRootPseudo', {
    
    methods : {
        
        // add :root pseudo CQ selector to be able to identify 'root' level components that don't have
        // parent containers. value is 1-based
        installRootPseudoCQ : function (Ext) {
            if (!Ext) return
            
            var CQ      = Ext.ComponentQuery
            
            if (!CQ || (CQ.pseudos.root && CQ.pseudos.root.__IS_ROOT_PSEUDO_OVERRIDE__)) return
            
            var rootPseudo = function (items, value) {
                var i = 0, l = items.length, c, result = [];
                var findAllRoots = value === undefined

                if (!findAllRoots) {
                    value = Number(value) - 1;
                }

                for (; i < l; i++) {
                    c = items[i].up();
                    var hasParentContainer = c && c.contains && c.contains(items[i]);

                    if (!hasParentContainer) {
                        result.push(items[i]);
                    }
                }

                if (!findAllRoots) {
                    result = result[value] ? [result[value]] : [];
                }

                return result;
            }
            
            rootPseudo.__IS_ROOT_PSEUDO_OVERRIDE__ = true
            
            CQ.pseudos.root = rootPseudo
            
            var version     = Ext.getVersion && Ext.getVersion('ext')
            
            if (version && version.major == 4) {
                // install workarounds for ExtJS 4 which does not pay any attention to attribute values
                // escaping/unescaping
                Ext.dom.Query.operators[ '=' ] = function (a, b) {
                    return a == Sizzle.unescape(b)
                }
                
                var prevQuery   = CQ.query
                
                // also ExtJS4 CQ just "split" the query by "," even that comma can be part of string expression
                CQ.query        = function (query, root) {
                    if (/\\,/.test(query)) 
                        return prevQuery.call(this, { split : function () { return [ query ] } }, root)
                    else
                        return prevQuery.call(this, query, root)
                }
            }
        }
    }
});
