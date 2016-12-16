/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class("Siesta.Util.TreeStoreFilterer", {
    
    has : {
        idProp          : { required : true },
        childNodesProp  : { required : true },
        parentNodeProp  : { required : true },
        isLeaf          : { required : true }
    },
    
    does    : [
        Siesta.Util.Role.CanEscapeRegExp
    ],
    
    methods : {
        
        parseFilterValue : function (filterValue) {
            var parts               = filterValue.split(/\s*\>\s*/)
            
            var groupFilter         = parts.length > 1 ? parts[ 0 ] : ''
            var leafFilter          = parts.length > 1 ? parts[ 1 ] : parts[ 0 ]
            
            return {
                testFilterRegexps   : this.splitTermByPipe(leafFilter),
                groupFilterRegexps  : groupFilter ? this.splitTermByPipe(groupFilter) : null
            }
        },
        
        
        checkCommonFilter : function (node, getTitle, testFilterRegexps, groupFilterRegexps) {
            if (groupFilterRegexps) {
                var currentNode     = node
                var isInGroup       = false

                while (currentNode && currentNode[ this.parentNodeProp ]) {
                    var parent      = currentNode[ this.parentNodeProp ]

                    if (this.matchAnyOfRegExps(getTitle(parent), groupFilterRegexps)) {
                        isInGroup   = true
                        break
                    }

                    currentNode     = parent
                }

                if (!isInGroup) return false
            }

            if (this.matchAnyOfRegExps(getTitle(node), testFilterRegexps)) return true

            // if there's no name filtering testFilterRegexps - return true (show all elements)
            return !testFilterRegexps.length
        },
        
        // split term by | first, then by whitespace
        splitTermByPipe : function (term) {
            var parts           = term.split(/\s*\|\s*/);
            var regexps         = []
            var me              = this
    
            for (var i = 0; i < parts.length; i++) {
                // ignore empty
                if (parts[ i ]) {
                    regexps.push(
                        Joose.A.map(parts[ i ].split(/\s+/), function (token) {
                            return new RegExp(me.escapeRegExp(token), 'i')
                        })
                    )
                }
            }
            
            return regexps
        },
        
        
        matchAnyOfRegExps : function (string, regexps) {
            for (var p = 0; p < regexps.length; p++) {
                var groupMatch  = true
                var len         = regexps[ p ].length
    
                // blazing fast "for" loop! :)
                for (var i = 0; i < len; i++)
                    if (!regexps[ p ][ i ].test(string)) {
                        groupMatch = false
                        break
                    }
    
                if (groupMatch) return true
            }
            
            return false
        },
        

        collectNodes : function (root, params) {
            var me                      = this;
            
            var filter                  = params.filter;
            var scope                   = params.scope || this;
            var shallowScan             = params.shallow;
            var checkParents            = params.checkParents || shallowScan;
            var fullMatchingParents     = params.fullMatchingParents;
            var onlyParents             = params.onlyParents || fullMatchingParents;
    
            if (onlyParents && checkParents) throw new Error("Can't combine `onlyParents` and `checkParents` options");
            
            var idProp                  = this.idProp
            var parentNodeProp          = this.parentNodeProp
            var childNodesProp          = this.childNodesProp
            var isLeaf                  = this.isLeaf
            
            var rootVisible             = params.rootVisible
            
            var visibleNodes            = {}
    
            var includeNodeInResults    = function (node) {
                visibleNodes[ node[ idProp ] ] = true;
                
                var parent      = node[ parentNodeProp ];
    
                while (parent && !visibleNodes[ parent[ idProp ] ]) {
                    visibleNodes[ parent[ idProp ] ] = true;
    
                    parent      = parent[ parentNodeProp ];
                }
            };
            
            var cascadeNode             = function (node, func) {
                func(node)
                
                var childNodes  = node[ childNodesProp ];
                var length      = childNodes.length;
                
                // at this point nodeMatches and fullMatchingParents can't be both true
                for (var k = 0; k < length; k++) 
                    if (isLeaf(node))
                        func(node)
                    else
                        cascadeNode(childNodes[ k ], func)
            }
    
            if (rootVisible) visibleNodes[ root[ idProp ] ] = true
    
            var collectNodes    = function (node) {
                if (node.hidden) return;
    
                var nodeMatches, childNodes, length, k;
    
                // `collectNodes` should not be called for leafs at all
                if (isLeaf(node)) {
                    if (filter.call(scope, node, visibleNodes)) {
                        includeNodeInResults(node);
                    }
                } else {
                    if (onlyParents) {
                        nodeMatches     = filter.call(scope, node);
    
                        if (nodeMatches) {
                            includeNodeInResults(node);
    
                            // if "fullMatchingParents" option enabled we gather all matched parent's sub-tree
                            if (fullMatchingParents) {
                                cascadeNode(node, function (currentNode) {
                                    visibleNodes[ currentNode[ idProp ] ] = true;
                                });
    
                                return;
                            }
                        }
    
                        childNodes      = node[ childNodesProp ];
                        length          = childNodes.length;
                        
                        // at this point nodeMatches and fullMatchingParents can't be both true
                        for (k = 0; k < length; k++)
                            if (nodeMatches && isLeaf(childNodes[ k ]))
                                visibleNodes[ childNodes[ k ][ idProp ] ] = true;
                            else if (!isLeaf(childNodes[ k ]))
                                collectNodes(childNodes[ k ]);
    
                    } else {
                        // mark matching nodes to be kept in results
                        if (checkParents) {
                            nodeMatches = filter.call(scope, node, visibleNodes);
    
                            if (nodeMatches) {
                                includeNodeInResults(node);
                            }
                        }
    
                        // recurse if
                        // - we don't check parents
                        // - shallow scan is not enabled
                        // - shallow scan is enabled and parent node matches the filter or it does not, but its and invisible root, so we don't care
                        if (!checkParents || !shallowScan || shallowScan && (nodeMatches || node == root && !rootVisible)) {
                            childNodes      = node[ childNodesProp ];
                            length          = childNodes.length;
    
                            for (k = 0; k < length; k++) collectNodes(childNodes[ k ]);
                        }
                    }
                }
            };
    
            collectNodes(root);
            
            return visibleNodes
        }
    }
});
