/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder.Maze', {
    
    does        : [
        Siesta.Util.Role.CanGetType
    ],
    
    has        : {
        finder              : { required : true },
        
        nodes               : Joose.I.Array,
        
        segmentsIdGen       : 1,
        
        encounteredMandatoryId      : false
    },
    

    methods : {
        
        getRoot : function () {
            return this.nodes[ this.nodes.length - 1 ]
        },
        
        
        doQuery : function (query, rootNode) {
            var queryCache      = rootNode.queryCache
            
            // TUNE
//            if (queryCache[ query ]) console.log("CACHE HIT!")
            
            if (queryCache[ query ]) return queryCache[ query ]
            
//            // TUNE
//            QUERYCOUNTER        = window.QUERYCOUNTER || 0
//            QUERYCOUNTER++
            
//            console.log("QUERY from:", rootNode.index, " query: ", query)
            
            return queryCache[ query ] = this.finder.doQuery(query, rootNode.el)
        },
        
        
        buildVertices : function (target, root) {
//            console.time('buildVertices')
            
            var nodes       = this.nodes = []
            var currentEl   = target
            
            var prevNode
            
            var finder                  = this.finder
            var identifiers             = finder.identifiers
            var directChildIdentifier   = finder.directChildIdentifier
            
            while (currentEl) {
                var node        = new Ariadne.QueryFinder.Node({
                    finder      : finder,
                    maze        : this,
                    el          : currentEl,
                    
                    index       : nodes.length
                })
                
                if (prevNode) {
                    prevNode.upNode = node
                    node.downNode   = prevNode
                    
                    if (directChildIdentifier) {
                        var segment                 = directChildIdentifier.identify(prevNode.el, root, this)
                        
                        if (segment) {
                            segment                 = this.normalizeIdentifierResult(segment)[ 0 ]
                            
                            var directChildUpEdge   = new Ariadne.QueryFinder.Edge({
                                finder      : finder,
                                maze        : this,
                                
                                isDirectChild   : true,
                                
                                fromNode    : prevNode,
                                toNode      : node
                            })
                            
                            prevNode.directChildUpEdge  = directChildUpEdge
                            
                            prevNode.adoptSegment(segment)
                            
                            directChildUpEdge.consumeVariant([ segment ], finder.combineSegments([ segment ], true))
                        }
                    }
                }
                
                prevNode        = node
                
                nodes.push(node)

                // exit a bit earlier for root node - segments won't be set for it
                if (currentEl == root) break
                
                var segments    = []
                
                for (var j = 0; j < identifiers.length; j++) {
                    var compSegments    = identifiers[ j ].identify(currentEl, root, this)
                    
                    if (compSegments) {
                        segments.push.apply(segments, this.normalizeIdentifierResult(compSegments))
                    }
                }
                
                node.setSegments(segments)
                
                currentEl       = finder.getParent(currentEl)
            }
            
            nodes[ 0 ].weightOptions                = [ { weight : 0, minFromEdgesById : {} } ]
            nodes[ 0 ].weightOptionsByWeight[ 0 ]   = nodes[ 0 ].weightOptions[ 0 ]
            
//            console.timeEnd('buildVertices')
        },
        
        
        normalizeIdentifierResult : function (segments) {
            var me          = this
            
            if (this.typeOf(segments) != 'Array') segments = [ segments ]
            
            return segments.map(function (segment) {
                if (me.typeOf(segment) == 'String')
                    return {
                        query       : segment,
                        weight      : 1000
                    }
                else {
                    if (!segment.hasOwnProperty('weight')) segment.weight = 1000
                    
                    return segment
                }
            })
        },
        
        
        computePath : function (prevUpdatedNodes) {
            var nodes               = this.nodes
            var root                = this.getRoot()
            
            var iteration           = 0
            
            if (!prevUpdatedNodes) {
                prevUpdatedNodes    = {}
                
                prevUpdatedNodes[ nodes[ 0 ].id ] = nodes[ 0 ]
            }
            
            do {
                iteration++
                
                var updatedNodes        = {}
                var somethingUpdated    = false
                
                for (var id in prevUpdatedNodes) {
                    var fromNode    = prevUpdatedNodes[ id ]
                    
                    if (fromNode.weightOptions.length === 0) continue
                    
                    for (var toIndex in fromNode.edgesToByIndex) {
                        var edge    = fromNode.edgesToByIndex[ toIndex ]
                        var toNode  = edge.toNode
                        
                        if (edge.relax()) {
                            updatedNodes[ toNode.id ]   = toNode
                            somethingUpdated            = true
                        }
                    }
                    
                    var directChildUpEdge   = fromNode.directChildUpEdge
                    
                    if (directChildUpEdge && directChildUpEdge.relax()) {
                        var toNode  = directChildUpEdge.toNode
                        
                        updatedNodes[ toNode.id ]   = toNode
                        somethingUpdated            = true
                    }
                }
                
                prevUpdatedNodes    = updatedNodes
                
            } while (somethingUpdated && iteration < nodes.length)
        },
        
        
        buildEdges : function () {
//            console.time('buildEdges')
            
            var recognizers = this.finder.recognizers
            
            for (var j = 0; j < recognizers.length; j++) {
                recognizers[ j ].recognize(this)
            }
            
            var nodes       = this.nodes
            
            for (var i = 0; i < nodes.length - 1; i++) {
                // early exit, as soon as we found identifying edge
                // by definition, we aren't interested in edges above it
                if (nodes[ i ].buildEdges3(1) === false) break
                
                nodes[ i ].buildEdges3(2)
                nodes[ i ].buildEdges3(3)
            }
            
//            console.timeEnd('buildEdges')
        },
        
        
        expandSimplePaths : function (paths) {
            var nodes           = this.nodes
            
            var pathsHashes     = {}
            var pathVariants    = []
            
            for (var i = 0; i < paths.length; i++) {
                var path        = paths[ i ].split('_')
                
                var variants    = []
                
                var prevIndex
                
                for (var j = path.length - 1; j > 1; j--) {
                    var isDirectChildEdge   = path[ j ][ 0 ] == '+'
                    var onlyWithOwnIndex    = j < path.length - 1 && path[ j + 1 ][ 0 ] == '+'
                    
                    var fromNode    = nodes[ Number(path[ j ]) ]
                    var edge        = isDirectChildEdge ? fromNode.directChildUpEdge : fromNode.edgesToByIndex[ Number(path[ j - 1 ]) ]
                    
                    variants        = fromNode.extendPathVariants(variants, edge.segmentVariants, onlyWithOwnIndex ? fromNode.index : null)
                }
                
                for (var k = 0; k < variants.length; k++) {
                    var pathVariant = variants[ k ]
                    
                    if (!pathsHashes[ pathVariant.hash ]) {
                        pathVariants.push(pathVariant)
                        
                        pathsHashes[ pathVariant.hash ] = true
                    }
                }
            }
            
            pathVariants.sort(function (a, b) { return a.weight - b.weight })
            
            return pathVariants
        },
        
        
        findAllPaths : function (options) {
//            console.time('computePath')
            this.computePath()
//            console.timeEnd('computePath')
            
            var me              = this
            var root            = this.getRoot()
            
//            console.time('collectAllPaths')
            
            var simplePathsCollection   = root.collectFullSimplePathCollection()
            
//            console.timeEnd('collectAllPaths')
            
//            console.log("Simple paths: ", simplePathsCollection)
            
            for (var i = 0; i < simplePathsCollection.length; i++) {
                var simplePaths = simplePathsCollection[ i ].simplePaths
                
                var queryInfos  = this.verifySimplePathGroup(simplePaths, options)
                
                if (queryInfos.length) {
                    if (options && options.detailed) {
                        return queryInfos
                    } else
                        return queryInfos.map(function (queryInfo) { return queryInfo.query })
                }
            }
            
            return []
        },
        
        
        verifySimplePathGroup : function (simplePaths) {
            var root            = this.getRoot()
            var finder          = this.finder
            
//            console.time('expandAllPaths')
            
            var pathVariants    = this.expandSimplePaths(simplePaths)
            
//            console.timeEnd('expandAllPaths')
            
//            console.time('verifyAllPaths')
            
            var queryInfos      = []
            
            pathVariants.forEach(function (variant) {
                var segments    = []
                
                for (var id in variant.segmentsById) segments.push(variant.segmentsById[ id ])
                
                // query can potentially not be constructed because of clash between leading segments
                var queryInfo   = finder.combineSegments(segments)
                
                queryInfo && queryInfos.push(queryInfo)
            })
            
            var targetEl        = this.nodes[ 0 ].el
            var rootEl          = root.el
            
            queryInfos          = queryInfos.filter(function (queryInfo) {
                var check       = finder.verifyQuery(queryInfo.query, targetEl, rootEl)
                
//                // TUNE
//                if (!check) console.log("WRONG QUERY: " + queryInfo.query)
                
                return check
            })
            
//            console.timeEnd('verifyAllPaths')
            
            return queryInfos
        },
        
        
        // DEBUG METHOD
        countEdges : function (log) {
            var counter     = 0
            
            this.nodes.forEach(function (node) {
                for (var index in node.edgesToByIndex) {
                    var edge        = node.edgesToByIndex[ index ]
                    
                    counter         += edge.segmentVariants.length
                    
                    if (log) {
                        edge.segmentVariants.forEach(function (variant) {
                            console.log("Edge from: " + edge.fromNode.index + "[" + edge.fromNode.el.tagName + "] to " + edge.toNode.index + "[" + edge.toNode.el.tagName + "] query: " + edge.finder.combineSegments(variant.variant).query)
                        })
                    }
                }
            })
            
            return counter
        }
        
    }
});
