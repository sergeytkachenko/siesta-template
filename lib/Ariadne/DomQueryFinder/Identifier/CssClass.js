/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.DomQueryFinder.Identifier.CssClass', {
    
    isa         : Ariadne.QueryFinder.Identifier,
    
    does        : Ariadne.DomQueryFinder.Role.DomHelper,

    has         : {
        // an array of strings, which will be join with "|" and converted to RegExp
        // values from the class definition will be combined with the values provided to the instance
        ignoreCssClasses            : function () {
            return [
                '^null$',
                '^undefined$'
            ]
        },
        
        ignoreCssClassesRegExp      : null
    },

    
    methods : {
        
        initialize : function (cfg) {
            var ignoreCssClasses        = this.mergeArrayAttributeFromClassHierarchy('ignoreCssClasses', cfg)
            
            this.ignoreCssClassesRegExp = ignoreCssClasses.length ? new RegExp(ignoreCssClasses.join('|')) : /\0/
        },
        
        
        identify : function (target, root, maze) {
            var classes             = this.processCssClasses(this.getCssClasses(target), target)
            
            var segments            = []
            
            for (var i = 0; i < classes.length; i++) {
                // use object notation for segment, so subclasses can call SUPER and assign custom weights
                segments.push({ 
                    query       : '.' + this.escapeDomSelector(classes[ i ], true),
                    weight      : this.getWeightForCssClass(classes[ i ], target)
                })
            }
                    
            return segments
        },
        
        
        getWeightForCssClass : function (cls, target) {
            return 1000
        },
        
        
        ignoreCssClass : function (cls, dom) {
            return this.ignoreCssClassesRegExp.test(cls)
        },
        
        
        processCssClasses : function (classes, target) {
            return classes
        }
    }
    // eof methods
});
