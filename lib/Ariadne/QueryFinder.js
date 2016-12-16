/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder', {
    
    does        : [
        Ariadne.QueryFinder.TreeWalker
    ],

    has         : {
        recognizers     : Joose.I.Array,
        identifiers     : Joose.I.Array,
        
        directChildIdentifier       : null,
        
        // `true` to always include an #id segment of the 1st parent node with #id in the query
        // even if its not required
        // idea is that since some parent has #id, element "belongs" to that parent, and the query 
        // will be more robust
        // note, that id's of the following parents won't be included
        enableMandatoryId           : true
    },

    methods : {
        
        initialize : function () {
            this.initRecognizers()
            this.initIdentifiers()
            
            this.recognizers.sort(function (r1, r2) {
                return r2.priority - r1.priority
            })
            
            this.identifiers.sort(function (r1, r2) {
                return r2.priority - r1.priority
            })
        },
        
        
        addRecognizer : function (instance) {
            this.recognizers.push(instance)
            
            return instance
        },
        
        
        addIdentifier : function (instance) {
            this.identifiers.push(instance)
            
            return instance
        },
        
        
        initRecognizers : function () {
        },
        
        
        initIdentifiers : function () {
        },
        
        
        findQuery : function (target, root) {
            return this.findQueries(target, root)[ 0 ]
        },
        
        
        findQueries : function (target, root, options) {
            // TUNE
//            console.time('TOTAL')
            
            if (!target) throw new Error("No target")
            if (!root) throw new Error("No root")
            
            if (target == root) throw new Error("Can't find query - target and root are the same")
            
            if (this.contains(target, root)) throw new Error("Can't find query - root is contained within target, need to swap the arguments?")
            
            var maze    = /*MAZE = */new Ariadne.QueryFinder.Maze({ finder : this })
            
            maze.buildVertices(target, root)
            maze.buildEdges()
            
            var res     = maze.findAllPaths(options)
            
            // TUNE
//            console.timeEnd('TOTAL')
            
            return res
        },
        
        
        forAllCombinations : function (segments, func) {
            var combinator      = new Ariadne.QueryFinder.Combinator({ elements : segments })
            
            return combinator.forAllCombinations(func)
        },
        
        
        bisect : function (leftIndex, rightIndex, func) {
            while (leftIndex <= rightIndex) {
                var middleIndex     = Math.round((leftIndex + rightIndex) / 2)
                
                var res             = func(middleIndex)
                
                if (res === false) return false
                
                if (leftIndex == rightIndex) return
                
                if (res == null) throw new Error("Unknown bisect direction")
                
                if (res < 0) rightIndex     = middleIndex - 1
                if (res > 0) leftIndex      = middleIndex + 1
            } 
        },
        
        
        combineSegments : function (segments, allowDanglingDirectChild) {
            var queryComponents = []
            var totalWeight     = 0
            var ids             = []
            var processed       = {}
            var hasId           = false
            
            for (var i = 0; i < segments.length; i++ ) {
                var segment     = segments[ i ]
                var segmentId   = segment.id
                
                if (processed[ segmentId ]) continue
                
                processed[ segmentId ] = true
                
                ids.push(segmentId)
                
                var index           = segment.index
                
                var queryComponent  = queryComponents[ index ]
                
                if (!queryComponent) {
                    queryComponent  = queryComponents[ index ] = { segments : [], hasLeading : false, child : false }
                }
                
                totalWeight         += segment.weight
                
                if (segment.leading)
                    if (queryComponent.hasLeading) 
                        return null
                    else {
                        queryComponent.hasLeading = true
                        
                        queryComponent.segments.unshift(segment.query)
                    }
                else
                    queryComponent.segments.push(segment.query)
                    
                if (segment.child) queryComponent.child = true
                if (segment.isId) hasId = true
            }
            
            var query               = ''
            
            for (var i = queryComponents.length - 1; i >= 0; i--) {
                var queryComponent  = queryComponents[ i ]
                
                if (queryComponent) {
                    if (!allowDanglingDirectChild && queryComponent.child && (i == queryComponents.length - 1 || !queryComponents[ i + 1 ])) throw new Error("Invalid direct child component")
                    
                    var component   = queryComponent.segments.join('')
                    
                    if (!query)
                        query       = component
                    else
                        query       += (queryComponent.child ? ' > ' : ' ') + component
                }
            }
            
            ids.sort(function (a, b) { return a - b })
            
            return {
                query           : query,
                weight          : totalWeight,
                hasId           : hasId,
                hash            : ids.join('')
            }
        },
        
        
        doQuery : function (query, root) {
            throw new Error("Abstract method called: `doQuery`")
        },
        
        
        verifyQuery : function (query, target, root) {
            var queryRes        = this.doQuery(query, root)
            
            return queryRes.length == 1 && queryRes[ 0 ] == target
        }
    }
});
