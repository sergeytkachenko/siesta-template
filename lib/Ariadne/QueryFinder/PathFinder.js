/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Ariadne.QueryFinder.PathFinder', {
    
    has        : {
        // array of objects: 
        // { weight : Number, minFromEdgesById : Object }
        // "minFromEdgesById" sample object: { edgeId : edge }
        weightOptions               : Joose.I.Array,
        
        weightOptionsByWeight       : Joose.I.Object
    },
    

    methods : {
        
        // paths - array of paths (path is object like: { segmentsById : {}, hash : '', weight : 0, ids : [] } )
        // variants - array of segments array (from edge)
        // returns new array of paths or empty array, if variants does not contain any new segment
        extendPathVariants : function (pathVariants, variants, onlyWithIndex) {
            if (pathVariants.length == 0) {
                pathVariants       = [ { segmentsById : {}, hash : '', weight : 0, ids : [] } ]
            }
            
            var pathLen     = pathVariants.length
            var varLen      = variants.length
            
            var extendedPaths   = []
            var pathsHashes     = {}
            
            for (var i = 0; i < pathLen; i++) {
                var pathVariant    = pathVariants[ i ]
                
                for (var v = 0; v < varLen; v++) {
                    var variant             = variants[ v ]
                    
                    if (onlyWithIndex != null && !variant.indicies[ onlyWithIndex ]) continue
                    
                    var segments            = variant.variant
                    
                    var newPathVariant      = pathVariant
                    var hasNewSegment       = false
                    
                    for (var s = 0; s < segments.length; s++) {
                        var segment         = segments[ s ]
                        
                        if (!newPathVariant.segmentsById[ segment.id ]) {
                            // lazily clone the pathVariant variant, when we've discovered some new segment
                            if (!hasNewSegment) {
                                hasNewSegment   = true
                                
                                newPathVariant  = this.clonePathVariant(pathVariant)
                            }
                            
                            newPathVariant.segmentsById[ segment.id ] = segment
                            newPathVariant.weight += segment.weight
                            newPathVariant.ids.push(segment.id)
                        }
                    }
                    
                    if (hasNewSegment) {
                        newPathVariant.ids.sort(function (a, b) { return a - b })
                        newPathVariant.hash     = newPathVariant.ids.join('')
                    }
                    
                    if (!pathsHashes[ newPathVariant.hash ]) {
                        pathsHashes[ newPathVariant.hash ] = true
                        
                        extendedPaths.push(newPathVariant)
                    }
                }
            }
            
            return extendedPaths
        },
        
        
        clonePathVariant : function (pathVariant) {
//            CLONECOUNTER            = window.CLONECOUNTER || 0
//            CLONECOUNTER++
            
            var clone               = Object.assign ? Object.assign({}, pathVariant) : Joose.O.copy(pathVariant)
            
            clone.segmentsById      = Object.assign ? Object.assign({}, clone.segmentsById) : Joose.O.copy(clone.segmentsById)
            clone.ids               = clone.ids.slice()
            
            return clone
        },
        
        
        collectAllSimplePathsOfWeight : function (weight, paths, isDirectChild) {
            if (!paths) 
                paths               = [ '' ]
            else
                paths               = paths.slice()
            
            var pathsLen            = paths.length
            
            for (var i = 0; i < pathsLen; i++) {
                paths[ i ]          += (isDirectChild ? '_+' : '_') + this.index
            }
            
            var weightOption        = this.weightOptionsByWeight[ weight ]
            if (!weightOption) throw new Error("Incorrect path weight")
            
            var minFromEdgesById    = weightOption.minFromEdgesById
            
            if (Joose.O.isEmpty(minFromEdgesById))
                return paths
            else {
                var allPaths            = []
                
                for (var id in minFromEdgesById) {
                    var edge        = minFromEdgesById[ id ]
                    
                    allPaths.push.apply(
                        allPaths, 
                        edge.fromNode.collectAllSimplePathsOfWeight(weight - edge.weight, paths, edge.isDirectChild)
                    )
                }
                
                return allPaths
            }
        },
        
        
        collectFullSimplePathCollection : function () {
            var simplePaths     = []
            
            for (var i = 0; i < this.weightOptions.length; i++) {
                var weightOption        = this.weightOptions[ i ]
                
                simplePaths.push({
                    weight      : weightOption.weight,
                    simplePaths : this.collectAllSimplePathsOfWeight(weightOption.weight)
                })
            }
            
            return simplePaths
        }
    }
});
