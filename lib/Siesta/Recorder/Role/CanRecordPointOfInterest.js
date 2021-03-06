/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.Role.CanRecordPointOfInterest

A mixin, providing the feature of recording the "moveCursorTo" event, when cursor is moved over certain
"point of interest", which can be specified as an array of CSS selectors: {@link #moveCursorToSelectors}.

This feature ensures that cursor is following the same path, activating the same UI elements as during recording
session, like menu items, various hover elements etc. 

*/
Role('Siesta.Recorder.Role.CanRecordPointOfInterest', {
    
    does        : Siesta.Util.Role.CanMergeArrayAttributeFromClassHierarchy,

    has : {
        /**
         * @cfg {Array[String]} moveCursorToSelectors An array of strings with CSS selectors. If the mouse is 
         * moved upon a target, matching any of these selectors, a `moveCursorTo` will be recorded
         */
        moveCursorToSelectors           : Joose.I.Array,

        pointOfInterestSelector         : null,
        
        /**
         * @cfg {Boolean} recordPointsOfInterest Set this option to `true` to enable recording of "points of interest",
         * specified with the {@link #moveCursorToSelectors} CSS selectors
         */
        recordPointsOfInterest          : true,
        
        lastPointOfInterestEl           : null
    },


    override : {
        
        initialize : function (cfg) {
            // will be merged from all the base classes, and also prepended with the possible config value, passed by the user
            this.moveCursorToSelectors          = this.mergeArrayAttributeFromClassHierarchy('moveCursorToSelectors', cfg)
            
            this.pointOfInterestSelector        = this.recordPointsOfInterest ? this.moveCursorToSelectors.join(',') : null
            
            if (this.pointOfInterestSelector) this.recordMouseMove = true
            
            this.SUPERARG(arguments)
        },

        
        onStart : function () {
            this.SUPERARG(arguments)
            
            if (this.pointOfInterestSelector) {
                this.lastPointOfInterestEl = null;
            }
        },


        onStop : function () {
            this.SUPERARG(arguments)
            
            if (this.pointOfInterestSelector) {
                this.lastPointOfInterestEl = null;
            }
        },

        
        processBodyMouseOver : function(e) {
            this.SUPERARG(arguments)
            
            var pointOfInterestSelector = this.pointOfInterestSelector
            
            if (!pointOfInterestSelector) return
            
            var pointOfInterestEl = e.target;

            if (
                this.is(pointOfInterestEl, pointOfInterestSelector) 
                || (pointOfInterestEl = this.closest(e.target, pointOfInterestSelector, 10))
            ) {

                if (pointOfInterestEl !== this.lastPointOfInterestEl) {
                    this.lastPointOfInterestEl = pointOfInterestEl
                    
                    // note, that `moveCursorTo` action is still recorded with real target of the event,
                    // which may be different from the `pointOfInterestEl`
                    this.addMoveCursorAction(e)
                }
            }
        },
        
        
        processBodyMouseOut : function (e) {
            this.SUPERARG(arguments)
            
            if (!this.pointOfInterestSelector || !this.lastPointOfInterestEl) return
            
            if (!this.contains(this.lastPointOfInterestEl, e.target)) {
                this.lastPointOfInterestEl = null
            }
        }
    }
    // eof methods
});
