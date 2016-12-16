/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.ExtJS

To resolve a component, this is done in the following prio list

1. Custom (non-auto-gen Id, client provided)
2. Custom field property (see componentIdentifier). User provides button with "foo : 'savebutton'", possibly add CSS selector
3. Custom xtype, user provides subclassed button for example, possibly combined with CSS selector (composite query)
3. For components, add some intelligence, user generated CSS properties win over Ext CSS properties
3a. Buttons could look for iconCls, text etc
3b. Menuitems same thing
3c. Grids and lists provide nth-child to know which position in the list
3d. Find extra non Ext classes (they start with "x-"), which of course have been put there by client
4. CSS selector (class names, nodeName DIV etc)
5. Coordinates

The type of target, possible options:

- 'cq'      component query
- 'csq'     composite query


*/
Class('Siesta.Recorder.TargetExtractor.ExtJS', {
    isa     : Siesta.Recorder.TargetExtractor,

    does    : [
        Ariadne.ExtJSDomQueryFinder.Role.ExtJSHelper
    ],


    has : {
        // An accessor method to get the relevant Ext JS object for the target (which could reside inside an iframe)
        Ext                     : null,
        
        // do not calculate only-dom query for performance reasons
        skipDomQuery            : false,
        
        uniqueComponentProperty : null
    },

    methods : {

        initialize : function () {
            this.SUPER()
            
            this.ariadneDomFinder       = new Ariadne.ExtJSDomQueryFinder({
                uniqueDomNodeProperty       : this.uniqueDomNodeProperty,
                shouldIgnoreDomElementId    : this.shouldIgnoreDomElementId
            })
            
            var properties              = this.uniqueComponentProperty

            if (properties) 
                properties              = properties instanceof Array ? properties : [ properties ]
                
            this.ariadneCQFinder        = new Ariadne.ExtJSComponentQueryFinder({
                uniqueComponentProperty : properties
            })
            
            if (this.swallowExceptions) {
                this.findComponentQueryFor  = this.safeBind(this.findComponentQueryFor)
                this.findCompositeQueryFor  = this.safeBind(this.findCompositeQueryFor)
            }
        },

        
        setExt : function (node) {
            var doc     = node.ownerDocument;
            
            this.Ext    = (doc.defaultView || doc.parentWindow).Ext;

            this.ariadneCQFinder.setExt(this.Ext)
        },

        
        getTargets : function (event, saveOffset, targetOverride, onlyXY) {
            if (onlyXY) return this.SUPER(event, saveOffset, targetOverride, onlyXY);
            
            var target      = targetOverride || event.target;
            var component;

            this.setExt(target);

            var hasCQ       = this.Ext && this.Ext.ComponentQuery && (this.Ext.versions && !this.Ext.versions.touch);

            if (hasCQ) {
                component   = this.getComponentOfDomElement(target);
            }
            
            var compEl      = component && (component.el || component.element)
            compEl          = compEl && compEl.dom
            
            // 1. Ext might not exist in the page,
            // 2. Ext JS < 4 has no support for ComponentQuery
            // 3. We don't support recording Touch applications
            // 4. If the page has been translated by Google translate toolbar, then google will create copies
            //    of many component's elements with the same ids, which messes up everything
            //    so in this case, wrong component of the element can be found
            //    we add additional check, that target is inside of the component el,
            //    otherwise we skip all the component/composite queries
            if (!hasCQ || (compEl && !compEl.contains(target))) return this.SUPER(event, saveOffset, targetOverride);
            
            var result                  = []
            
            var hasCoordinates          = event.x != null && event.y != null

            // also try to find component/composite queries for the target
            if (component) {
                var componentQuery      = this.findComponentQueryFor(component)

                if (componentQuery) {
                    
                    result.unshift({
                        type        : 'cq',
                        target      : componentQuery,
                        offset      : hasCoordinates && (saveOffset || !this.isElementReachableAtCenter(compEl, false)) ? 
                            this.findOffset(event.x, event.y, compEl) 
                        : 
                            null
                    })
                    
                    // if `target` and `compEl` are the same - it means CQ is enough, no need to identify node any "deeper" 
                    if (compEl != target) {
                        var compositeQuery  = this.findCompositeQueryFor(target, componentQuery, component)
                        
                        if (compositeQuery)
                            result.unshift({
                                type        : 'csq',
                                target      : compositeQuery,
                                offset      : hasCoordinates && (saveOffset || !this.isElementReachableAtCenter(target, false)) ? 
                                    this.findOffset(event.x, event.y, target) 
                                : 
                                    null
                            })
                    }
                }
            }
            
            // only get XY from SUPER method if `skipDomQuery` is enablled _and_ we already have cq/csq target
            return result.concat(this.SUPER(event, saveOffset, targetOverride, this.skipDomQuery && result.length))
        },


        findCompositeQueryFor : function (node, componentQuery, component) {
            if (!componentQuery) {
                var component       = this.getComponentOfDomElement(node)
                
                if (!component) return null

                componentQuery  = this.findComponentQueryFor(component)

                if (!componentQuery) return null
            }

            var compEl              = component.el || component.element
            var root                = compEl.dom
            
            if (node == root || !root.contains(node)) return null

            var compositeDomQuery   = this.findDomQueryFor(node, root)

            return compositeDomQuery ? componentQuery + ' => ' + compositeDomQuery : null
        },


        findComponentQueryFor : function (comp, root) {
            return this.ariadneCQFinder.findQueries(comp, root)[ 0 ]
        }
        
        
// something old, not used remove after some time
//        // Component Query with extensions - ".someMethod()" at the end
//        doNonStandardComponentQuery : function (query, lookUpUntil) {
//            var Ext             = this.Ext
//            var match           = /(.+?)\.(\w+)\(\)/g.exec(query)
//
//            var trimmedQuery    = ((match && match[ 1 ]) || query).trim();
//            var methodName      = match && match[ 2 ]
//
//            // Discard any hidden components, special treatment of Ext Widgets that don't yet implement isVisible.
//            // https://www.sencha.com/forum/showthread.php?308370-CQ-crashes-if-widgets-are-used&p=1126410#post1126410
//            var matchedComponents   = Ext.ComponentQuery.query(trimmedQuery + ':not([isVisible])').concat(
//                Ext.ComponentQuery.query(trimmedQuery + '[isVisible]{isVisible()}')
//            )
//
//            if (methodName)
//                for (var i = 0; i < matchedComponents.length; i++)
//                    if (Object.prototype.toString.call(matchedComponents[ i ][ methodName ]) == '[object Function]')
//                        matchedComponents[ i ] = matchedComponents[ i ][ methodName ]()
//
//            return matchedComponents
//        },
//
//
//        resolveTarget : function (target) {
//            if (target.type == 'cq') {
//                var component   = this.doNonStandardComponentQuery(target.target)[ 0 ]
//                var el          = component && (component.el || component.element)
//
//                return el && el.dom
//            }
//
//            if (target.type == 'csq') {
//                var parts   = target.target.split('=>')
//
//                var compEl  = this.resolveTarget({ type : 'cq', target : parts[ 0 ] })
//
//                var el      = compEl && Sizzle(parts[ 1 ], compEl)[ 0 ]
//
//                return el
//            }
//
//            return this.SUPERARG(arguments)
//        }
    }
});
