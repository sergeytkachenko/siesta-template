/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Recorder.TargetExtractor

The type of target, possible options:

- 'css'     css selector
- 'xy'      XY coordinates

*/
Class('Siesta.Recorder.TargetExtractor', {

    does       : [
        Siesta.Util.Role.Dom,
        Siesta.Recorder.Role.CanSwallowException
    ],

    has        : {
        ariadneDomFinder            : null,
        
        shouldIgnoreDomElementId    : null,
        
        uniqueDomNodeProperty       : 'id',
        
        // optional, used as a bubble target for `exception` event 
        recorder                    : null
    },

    methods : {

        initialize : function () {
            this.ariadneDomFinder   = new Ariadne.DomQueryFinder({
                uniqueDomNodeProperty       : this.uniqueDomNodeProperty,
                shouldIgnoreDomElementId    : this.shouldIgnoreDomElementId
            })
            
            if (this.swallowExceptions) this.findDomQueryFor = this.safeBind(this.findDomQueryFor)
        },
        
        
        getBubbleTarget : function () {
            return this.recorder
        },
        
        
        findOffset : function (pageX, pageY, relativeTo) {
            var offset    = this.offset(relativeTo)
            
            offset.left   = offset.left
            offset.top    = offset.top

            var relativeOffset = [ pageX - offset.left, pageY - offset.top ]

            return relativeOffset;
        },
        
        
        findDomQueryFor : function (target, root) {
            return this.ariadneDomFinder.findQueries(target, root)[ 0 ]
        },
        
        
        getTargets : function (event, saveOffset, targetOverride, onlyXY) {
            var result              = []
            var cssQuery
            var target              = targetOverride || event.target;
            
            var hasCoordinates      = event.x != null && event.y != null
            
            if (onlyXY && !hasCoordinates) return result
            
            if (!onlyXY && (target != target.ownerDocument.body || !hasCoordinates)) {
                cssQuery            = this.findDomQueryFor(target)
    
                if (cssQuery) result.push({
                    type        : 'css',
                    target      : cssQuery,
                    offset      : hasCoordinates && (saveOffset || !this.isElementReachableAtCenter(target, false)) ? 
                        this.findOffset(event.x, event.y, target) 
                    : 
                        null
                })
            }

            hasCoordinates && result.push({
                type        : 'xy',
                target      : [ event.x, event.y ]
            })
            
            return result
        }

//        something old, not used, and wrong (as Sizzle is not re-scope), remove after some time
//-        resolveTarget : function (target) {
//-            if (target.type == 'css') {
//-                return Sizzle(target.target)[ 0 ]
//-            }
//-        },
    }
});
