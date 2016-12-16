/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder.Node', {
    
    does        : [
        Siesta.Util.Role.HasUniqueGeneratedId,
        Ariadne.QueryFinder.PathFinder
    ],

    has        : {
        finder                      : { required : true },
        maze                        : { required : true },
        el                          : { required : true },
        
        index                       : null,
        
        segments                    : null,
        
        combinator                  : null,
        
        upNode                      : null,
        downNode                    : null,
        
        queryCache                  : Joose.I.Object,
        
        edgesToByIndex              : Joose.I.Object,
        edgesFromByIndex            : Joose.I.Object,
        
        directChildUpEdge           : null
    },
    

    methods : {
        
        contains : function (node) {
            return this.finder.contains(this.el, node.el)
        },
        
        
        setSegments : function (value) {
            var me              = this
            
            value.sort(function (s1, s2) {
                return s1.weight - s2.weight
            })
            
            value.forEach(function (segment) {
                me.adoptSegment(segment)
            })
            
            this.segments       = value
            
            this.combinator     = new Ariadne.QueryFinder.Combinator({
                elements        : value
            })
        },
        
        
        adoptSegment : function (segment) {
            segment.index   = this.index
            segment.id      = this.maze.segmentsIdGen++
        },
        
        
        isReachedWithDirectChildEdge : function () {
            var minWeightOption     = this.weightOptions[ 0 ]
            var minFromEdgesById    = minWeightOption.minFromEdgesById
            
            for (var id in minFromEdgesById) {
                var edge            = minFromEdgesById[ id ]
                
                if (edge.isDirectChild) return true
            }
            
            return false
        },
        
        
        addEdgeTo : function (toNode, segments, segmentsCombInfo) {
            if (arguments.length == 2) {
                segmentsCombInfo = this.finder.combineSegments(segments)
            }
            
            var edge            = this.edgesToByIndex[ toNode.index ]
            
            if (!edge) {
                edge            = new Ariadne.QueryFinder.Edge({
                    finder      : this.finder,
                    maze        : this.maze,
                    
                    fromNode    : this,
                    toNode      : toNode
                })
                
                edge.register()
            }
            
            if (edge.weight >= segmentsCombInfo.weight)
                return edge.consumeVariant(segments, segmentsCombInfo)
        },
        
        
        addAllEdgesTo : function (toNode, segments, segmentsCombInfo) {
            if (toNode == this || this.contains(toNode)) throw new Error("Invalid nodes for edge")
            
            if (arguments.length == 2) {
                segmentsCombInfo = this.finder.combineSegments(segments)
            }
            
            for (var from = this; from && from != toNode; from = from.upNode) {
                for (var to = from.upNode; to && to != toNode.upNode; to = to.upNode) {
                    from.addEdgeTo(to, segments, segmentsCombInfo)
                }
            }
        },
        
        
        buildEdges3 : function (maxSegments) {
            var me              = this
            var el              = this.el
            
            var finder          = this.finder
            var maze            = this.maze
            
            var root            = maze.getRoot()
            
            var foundUniqueId   = false
            
//            var updatedNodes    = {}
            
//            this.combinator.forAllCombinations(function (segments) {
            this.combinator.forAllCombinationsOfLength(maxSegments, function (segments) {
//                COMBCOUNT           = window.COMBCOUNT || 0
//                COMBCOUNT++
                
                var segmentsCombInfo = finder.combineSegments(segments)
                
                if (!segmentsCombInfo) return
                
                var query           = segmentsCombInfo.query
                var rootNode        = root
                
                while (rootNode && rootNode != me) {
                    var existingEdge    = me.edgesToByIndex[ rootNode.index ]
                    
                    if (existingEdge) {
                        if (segmentsCombInfo.weight > existingEdge.weight) { rootNode = rootNode.downNode; continue }
                    }
                    
                    var queryRes    = maze.doQuery(query, rootNode)
                    
                    if (queryRes.length == 1 && queryRes[ 0 ] == el) {
                        me.addAllEdgesTo(rootNode, segments, segmentsCombInfo)
                        
                        if (rootNode == root && segmentsCombInfo.hasId) {
                            foundUniqueId   = true
                            return false
                        }
                        
                        break
                    } else
                        if (queryRes.length > 0) {
                            var commonContainer = rootNode.downNode
                            
                            var lowestCommonContainer   = null
//                            var ignoreElsOnTheAxis      = {}
                            
                            while (commonContainer && commonContainer != me) {
                                var containsAll         = true
                                
                                for (var i = 0; i < queryRes.length; i++) {
//                                    in theory we can ignore query results that belongs to axe, except
//                                    when those comes from the query of the target node
//                                    if (ignoreElsOnTheAxis[ i ] && me.index !== 0) continue
//                                    if (commonContainer.el == queryRes[ i ]) ignoreElsOnTheAxis[ i ] = true
                                    
//                                    if (!finder.contains(commonContainer.el, queryRes[ i ])) {
                                    if (commonContainer.el == queryRes[ i ] || !finder.contains(commonContainer.el, queryRes[ i ])) {
                                        containsAll = false
                                        break
                                    }
                                }
                                
                                if (containsAll) {
                                    lowestCommonContainer = commonContainer
                                } else
                                    break
                                
                                commonContainer     = commonContainer.downNode
                            }
                            
                            if (lowestCommonContainer) {
                                lowestCommonContainer.addAllEdgesTo(rootNode, segments, segmentsCombInfo)
                                
                                rootNode            = lowestCommonContainer
                            }
                        }
                        
                    rootNode    = rootNode.downNode
                }
            })
            
            return !foundUniqueId
//            return updatedNodes
        }
        // eof buildEdges3
    }
    // eof methods
});
