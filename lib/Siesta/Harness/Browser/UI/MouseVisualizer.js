/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// Internal class visualizing the cursor position, only used in good browsers (!== IE)
Class('Siesta.Harness.Browser.UI.MouseVisualizer', {

    has : {
        cursorEl                    : null,
        
        currentContainer            : null,

        clickEvents     : function () {
            return {
                mouseup     : null,
                touchend    : null,
                contextmenu : null
            }
        },

        mouseDownEvents : function () {
            return {
                touchstart  : null,
                mousedown   : null
            }
        },

        mouseUpEvents : function () {
            return {
                touchend    : null,
                mouseup     : null
            }
        }
    },

    methods : {
        
        initialize : function (config) {
            this.onEventSimulated = this.onEventSimulated.bind(this);
        },

        
        getCursorEl : function () {
            if (this.cursorEl) return this.cursorEl

            var currentContainer = this.currentContainer
            if (!currentContainer) throw "Need container for cursor"

            var el          = document.createElement('div');
            
            el.className    = 'ghost-cursor fa fa-mouse-pointer';

            return this.cursorEl = currentContainer.appendChild(el)
        },


        destroy : function () {
            var cursorEl            = this.cursorEl
            
            if (cursorEl) {
                cursorEl.parentElement.removeChild(cursorEl);
            
                this.cursorEl       = null
            }
            
            this.currentContainer   = null
        },

        
        beginCursorVisualization : function (window) {
            if (window.opener) throw new Error("Can't use mouse visualizer in popups")
            
            this.currentContainer   = window.frameElement.parentElement;
        },

        
        onEventSimulated : function (event, point) {
            if (typeof event.clientX === 'number') {

                var type = event.type,
                    x    = point[ 0 ],
                    y    = point[ 1 ]

                this.updateGhostCursor(x, y);

                if (type in this.clickEvents) {
                    this.showClickIndicator(type, x, y);
                } else if (type in this.mouseDownEvents) {
                    this.getCursorEl().classList.add('ghost-cursor-press');
                }

                if (type in this.mouseUpEvents || type in this.clickEvents) {
                    this.getCursorEl().classList.remove('ghost-cursor-press');
                }
            }
        },

        // This method shows a fading growing circle at the xy position
        showClickIndicator : function (type, x, y) {
            var clickEl = document.createElement('div');

            clickEl.className = 'ghost-cursor-click-indicator ';
            clickEl.style.setProperty('left', x + 'px');
            clickEl.style.setProperty('top', y + 'px');

            clickEl.addEventListener("animationend", this.afterAnimation);
            clickEl.addEventListener("webkitAnimationEnd", this.afterAnimation);

            this.currentContainer.appendChild(clickEl);
        },

        
        afterAnimation : function() {
            // "this" here is a DOM element instance
            this.parentElement && this.parentElement.removeChild(this);
        },

        
        // Updates the ghost cursor position and appearance
        updateGhostCursor : function (x, y) {
            var cursorEl        = this.getCursorEl()
            
            var translateStyle  = bowser.opera ? 
                'translate(' + x + 'px,' + y + 'px)' 
            :
                'translate3d(' + x + 'px, ' + y + 'px, 0)'

            cursorEl.style.setProperty('-webkit-transform', translateStyle)
            cursorEl.style.setProperty('transform', translateStyle)
        }
    }
});
