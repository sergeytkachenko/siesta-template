/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Ariadne.QueryFinder.TreeWalker', {
    
    methods : {
    
        getParent : function (el) {
            throw new Error("Abstract method called: `getParent`")
        },
        
        
        contains : function (parentEl, childEl) {
            throw new Error("Abstract method called: `contains`")
        }
    }
});
