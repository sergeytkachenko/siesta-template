/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Util.Role.CanMergeArrayAttributeFromClassHierarchy', {

    methods : {
        
        mergeArrayAttributeFromClassHierarchy : function (name, cfg) {
            var arrays      = []
            
            for (var meta = this.meta; meta.hasAttribute(name); meta = meta.superClass.meta) {
                arrays.push(meta.getAttribute(name).init())
            }
            
            if (cfg.hasOwnProperty(name) && this[ name ]) arrays.unshift(this[ name ])
            
            var result      = []
            
            arrays.forEach(function (array) { result.push.apply(result, array) })
            
            return result
        }
    }
});
