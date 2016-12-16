/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder.Edge', {
    
    does        : Siesta.Util.Role.HasUniqueGeneratedId,

    has        : {
        finder                      : { required : true },
        maze                        : { required : true },
        
        fromNode                    : { required : true },
        toNode                      : { required : true },
        
        // Array of { variant : segments, hash : hash, indicies : Object }
        segmentVariants             : Joose.I.Array,
        segmentVariantsHashes       : Joose.I.Object,
        
        isDirectChild               : false,
        
        weight                      : Infinity
    },
    

    methods : {
        
        register : function () {
            var fromNode        = this.fromNode
            var toNode          = this.toNode
            
            if (fromNode.edgesToByIndex[ toNode.index ]) throw new Error("Edge already exists")
            if (toNode.edgesFromByIndex[ fromNode.index ]) throw new Error("Edge already exists")
            
            fromNode.edgesToByIndex[ toNode.index ]     = this
            toNode.edgesFromByIndex[ fromNode.index ]   = this
        },
        
        
        consumeVariant : function (segments, segmentsCombInfo) {
                // TUNE
//            FOUNDEDGECOUNTER        = window.FOUNDEDGECOUNTER || 0
//            FOUNDEDGECOUNTER++
                
            if (arguments.length == 1) {
                segmentsCombInfo        = this.finder.combineSegments(segments)
            }
            
            var weight                  = segmentsCombInfo.weight
            var hash                    = segmentsCombInfo.hash
            
            if (this.weight > weight) {
//                if (this.weight < Infinity) console.log("REDEFINED: " + this.segmentVariants.length)
                
                this.weight                 = weight
                
                this.segmentVariants        = []
                this.segmentVariantsHashes  = {}
            }
            
//            if (this.segmentVariantsHashes[ hash ]) {
//                console.log("REPEATED")
//            }
            
            if (this.weight == weight && !this.segmentVariantsHashes[ hash ]) {
                // TUNE
//                console.log("Found edge from: " + this.   fromNode.index + "[" + this.fromNode.el.tagName + "] to " + this.toNode.index + "[" + this.toNode.el.tagName + "] query: " + segmentsCombInfo.query)
                
                // TUNE
//                FOUNDEDGECOUNTER        = window.FOUNDEDGECOUNTER || 0
//                FOUNDEDGECOUNTER++

                var indicies                        = {}
                // should collect all indicies (in the "combineSegments"?)
                indicies[ segments[ 0 ].index ]     = true

                this.segmentVariantsHashes[ hash ]  = true
                this.segmentVariants.push({ variant : segments, hash : hash, indicies : indicies })
                
                // indicates that something has changed
                return true
            }
        },
        
        
        relax : function () {
            var fromNode        = this.fromNode
            var toNode          = this.toNode
            
            if (fromNode.isReachedWithDirectChildEdge()) {
                var index               = fromNode.index
                var segmentVariants     = this.segmentVariants
                
                var hasVariantWithOwnSegments   = false
                
                for (var i = 0; i < segmentVariants.length; i++) {
                    if (segmentVariants[ i ].indicies[ index ]) {
                        hasVariantWithOwnSegments   = true
                        break
                    }
                }
                
                if (!hasVariantWithOwnSegments) return false
            }
            
            var possibleWeight          = this.weight + fromNode.weightOptions[ 0 ].weight
            
            var existingWeightOption    = toNode.weightOptionsByWeight[ possibleWeight ]
            
            if (existingWeightOption && !existingWeightOption.minFromEdgesById[ this.id ]) {
                existingWeightOption.minFromEdgesById[ this.id ] = this
                
                return true
            }
            
            if (!existingWeightOption) {
                var minFromEdgesById    = {}
                
                minFromEdgesById[ this.id ] = this
                
                var weightOption        = {
                    weight              : possibleWeight,
                    minFromEdgesById    : minFromEdgesById
                }
                
                toNode.weightOptionsByWeight[ possibleWeight ] = weightOption
                
                var weightOptions       = toNode.weightOptions
                
                for (var i = 0; i < weightOptions.length; i++) {
                    if (possibleWeight < weightOptions[ i ].weight) {
                        weightOptions.splice(i, 0, weightOption)
                        
                        return true
                    }
                }
                
                weightOptions.push(weightOption)
                
                return true
            }
        }
    }
});
