/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Ariadne.ExtJSComponentQueryFinder.TreeWalker', {
    
    methods         : {
        
        getParent   : function (cmp) {
            return cmp.getRefOwner && cmp.getRefOwner() || cmp.ownerCt || this.Ext.ComponentQuery
        },
        
        
        contains : function (parentCmp, childCmp) {
            if (parentCmp == this.Ext.ComponentQuery) return true
            if (childCmp == this.Ext.ComponentQuery) return false
            
            // "comp.contains()" may throw exception
            // https://www.sencha.com/forum/showthread.php?331619-6-2-CQ-crash&p=1164685#post1164685
            try {
                return parentCmp == childCmp || parentCmp.contains && parentCmp.contains(childCmp, true) || false
            } catch (e) {
                return false
            }
        }
    }
});
