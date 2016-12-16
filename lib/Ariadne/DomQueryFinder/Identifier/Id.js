/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.Id', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    does        : Ariadne.DomQueryFinder.Role.DomHelper,
    
    has : {
        uniqueDomNodeProperty       : null,
        
        shouldIgnoreDomElementId    : null
    },
    
    
    methods : {
        
        identify : function (target, root, maze) {
            var idProperty          = this.uniqueDomNodeProperty || 'id'
            var id                  = target.getAttribute(idProperty)
            
            var shouldIgnoreDomElementId = this.shouldIgnoreDomElementId
            
            if (id && !this.ignoreDomId(id, target) && (!shouldIgnoreDomElementId || !shouldIgnoreDomElementId(id, target))) {
                // the 1st encountered id will be assigned with weight -100000 in case of `enableMandatoryId`
                // it should be guaranteed that this id will belong to lowest parent with id (currently this holds)
                var weight          = maze.encounteredMandatoryId || !this.finder.enableMandatoryId ? 1000 : -100000
                
                maze.encounteredMandatoryId = true
                
                var query           = idProperty == 'id' ? 
                    '#' + this.escapeDomSelector(id, true) 
                : 
                    "[" + idProperty + "='" + this.escapeDomSelector(id) + "']"
                
                return {
                    query           : query,
                    weight          : weight,
                    isId            : true
                }
            } else
                return null
        },
        
        
        ignoreDomId : function () {
            return false
        }
    }
});
