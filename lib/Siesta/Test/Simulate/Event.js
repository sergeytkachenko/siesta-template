/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
 @class Siesta.Test.Simulate.Event

 This is a mixin providing events simulation functionality.

 */

Role('Siesta.Test.Simulate.Event', {

    requires : [
        'createTextEvent',
        'createMouseEvent',
        'createKeyboardEvent'
    ],

    has : {
        actionDelay      : 100,
        afterActionDelay : 100,

        /**
         * @cfg {String} simulateEventsWith
         *
         * This option is IE9-strict mode (and probably above) specific. It specifies, which events simulation function Siesta should use.
         * The choice is between 'dispatchEvent' (W3C standard) and 'fireEvent' (MS interface) - both are available in IE9 strict mode
         * and both activates different event listeners. See this blog post for detailed explanations:
         * <http://www.digitalenginesoftware.com/blog/archives/76-DOM-Event-Model-Compatibility-or-Why-fireEvent-Doesnt-Trigger-addEventListener.html>
         *
         * Valid values are "dispatchEvent" and "fireEvent".
         *
         * The framework specific adapters choose the most appropriate value automatically (unless explicitly configured).
         */
        simulateEventsWith : {
            is   : 'rw',
            init : 'dispatchEvent'
        }
    },

    methods : {

        processMouseEventName : function (eventName) {
            return eventName
        },


        /**
         * This method will simulate an event triggered by the passed element. If no coordinates are supplied in the options object, the center of the element
         * will be used.
         * @param {Siesta.Test.ActionTarget} el
         * @param {String} type The type of event (e.g. 'mouseover', 'click', 'keypress')
         * @param {Object} the options for the event. See http://developer.mozilla.org/en/DOM/event for reference.
         */
        simulateEvent : function (el, type, options) {
            var global  = this.global;
            options     = options || {};

            if (this.typeOf(el) == 'Array') {
                if (el.length == 0) el = this.currentPosition.slice()
                
                if (!('clientX' in options)) {
                    options.clientX = el[0];
                }

                if (!('clientY' in options)) {
                    options.clientY = el[1];
                }
            }

            el          = this.normalizeElement(el);

            var touchEvent
            var processed = this.processMouseEventName(type)

            // simulate extra touch event 1st - for touch enabled browsers, like IE10, 11 
            if (processed != type) {
                touchEvent = this.createEvent(processed, options, el);

                touchEvent.synthetic = true;

                this.dispatchEvent(el, processed, touchEvent);
            }

            var evt = this.createEvent(type, options, el);


            if (evt) {
                evt.synthetic = true;
                
                this.mimicBrowserBehaviorBefore(evt, type, el);
                
                this.dispatchEvent(el, type, evt);

                !this.isEventPrevented(evt) && this.mimicBrowserBehaviorAfter(evt, type, el);
            }

            // touch event is considered to be "main" for IE10, 11 cause ExtJS listens mostly those
            // and cancel flag will be returned in touch event..
            return touchEvent || evt;
        },

        
        createEvent : function (type, options, el) {
            var event

            if (/^textinput$/i.test(type)) {
                event = this.createTextEvent(type, options, el);
            } else if (/^mouse(over|out|down|up|move|enter|leave)|contextmenu|(dbl)?click$/.test(type) || /^(ms)?pointer/i.test(type)) {
                event = this.createMouseEvent(type, options, el);
            } else if (/^key(up|down|press)$/.test(type)) {
                event = this.createKeyboardEvent(type, options, el);
            } /*else if (/^touch/.test(type)) {
             return this.createTouchEvent(type, options, el);
             }*/
            else if (/^change$|^input$|^submit/.test(type)) {
                event = this.createGenericEvent(type, options, el);
            }
            else
                event = this.createHtmlEvent(type, options, el);

            // IE>=9 somehow reports that "defaultPrevented" property of the event object is `false`
            // even that "preventDefault()" has been called on the object
            // more over, immediately after call to "preventDefault()" the property is updated
            // but down in stack it is replaced with "false" again somehow
            // we setup our own, additional property, indicating that event has been prevented
            if (event && bowser.msie && bowser.version >= 9) {
                var prev = event.preventDefault

                event.preventDefault = function () {
                    arguments.callee.$prevented = true;
                    this.returnValue = false

                    return prev && prev.apply(this, arguments)
                }
            }

            return event
        },
        
        
        createGenericEvent : function (type, options, el) {
            var doc = el.ownerDocument;

            if (doc.createEvent && this.getSimulateEventsWith() == 'dispatchEvent') {
                var evt = doc.createEvent("Events");
                evt.initEvent(type, true, true);
                return evt;
            } else if (doc.createEventObject) {
                var event       = doc.createEventObject()
                
                event.srcElement    = el
                
                event.bubbles       = options.bubbles
                event.cancelBubble  = !options.bubbles
                event.type          = type
                
                return event
            }
        },

        
        createHtmlEvent : function (type, options, el) {
            var doc = el.ownerDocument;

            if (doc.createEvent && this.getSimulateEventsWith() == 'dispatchEvent') {
                var evt = doc.createEvent("HTMLEvents");
                evt.initEvent(type, false, false);
                return evt;
            } else if (doc.createEventObject) {
                return doc.createEventObject();
            }
        },

        
        dispatchEvent : function (el, type, evt) {

            // use W3C standard when available and allowed by "simulateEventsWith" option            
            if (el.dispatchEvent && this.getSimulateEventsWith() == 'dispatchEvent') {
                el.dispatchEvent(evt);
            } else if (el.fireEvent) {
                // IE 6,7,8 can't dispatch many events cleanly - throws exceptions
                try {
                    // this is the serios nominant to the best-IE-bug-ever prize and it's IE7 specific
                    // accessing the "scrollLeft" property on document or body triggers a synchronous(!) "resize" event on the window
                    // ExtJS uses a singleton for Ext.EventObj and its "target" property gets overwritten with "null"
                    // thus consequent event handlers fails
                    // doing an access to that property to cache it
                    var doc  = this.global.document.documentElement;
                    var body = this.global.document.body;

                    var xxx = doc && doc.scrollLeft || body && body.scrollLeft || 0;

                    el.fireEvent('on' + type, evt);
                } catch (e) {
                }
                
                // in IE, the "fireEvent" does not bubble the "change" event
                // we try to bubble it manually (to fix the TaskBoard2.x "subtasks" tests, but then
                // the target el is not set correctly and it goes too deep into Ext sources, so commenting for now
//                if (type == 'change') {
//                    if (el != doc && el != body && el.parentElement) this.dispatchEvent(el.parentElement, type, evt)
//                }
            } else
                throw "Can't dispatch event: " + type

            return evt;
        },

        mimicBrowserBehaviorBefore : function (event, type, target) {
        },

        mimicBrowserBehaviorAfter : function (event, type, target) {
            var tagName = target.tagName.toLowerCase();

            switch (type) {
                case 'mousedown':
                    if (this.isTextInput(target)) {
                        this.mimicClearTextSelection(target);
                    }
                    break;
                case 'click':
                    if (
                        bowser.msie && bowser.version < 11 &&
                        tagName === 'a' &&
                        target.getAttribute("href")
                    ) {
                        this.mimicHashUpdate(target);
                    } else if (tagName === 'option' && !target.getAttribute('disabled')) {
                        this.mimicOptionSelect(target);
                    }
                    break;
                case 'dblclick':
                    if (this.isTextInput(target)) {
                        this.mimicDblClickTextSelection(target);
                    }
                    break;
                case 'keydown':
                    var KeyCodes = Siesta.Test.Simulate.KeyCodes().keys

                    if (event.keyCode === KeyCodes.BACKSPACE) {
                        this.mimicHistoryChangeAfterBackspace(event, target);
                    }
                    break;
            }
        },

        // IE9+
        // Breaks IE9 with Ext JS 5.1.0, tested in .540_extjs_type.t.js?5.1.0
        mimicClearTextSelection : function (target) {
            var extVersion = this.global.Ext && this.global.Ext.versions;
            var isExtJS51  = extVersion && extVersion.extjs && extVersion.extjs.equals('5.1.0.107');

            if (!bowser.msie || !isExtJS51 || (bowser.version > 9)) {
                this.selectText(target, target.value.length - 1, target.value.length);

                this.setCaretPosition(target, target.value.length);
            }
        },

        mimicDblClickTextSelection : function (target) {
            this.selectText(target);
        },

        // After a click action in old IE, change location hash manually
        mimicHashUpdate : function (el) {
            var href = el.getAttribute("href").match(/#(.*)/);

            if (href) {
                this.global.location.hash = href[1];
            }
        },

        mimicHistoryChangeAfterBackspace : function (event, target) {
            // Chrome+Safari doesn't trigger page navigation (as of Chrome52)
            if (bowser.webkit) return;

            var doc      = target.ownerDocument;

            if (!target.isContentEditable && doc.designMode.toLowerCase() !== "on" && !this.isTextInput(target)) {
                var elWindow = target.ownerDocument.defaultView || target.ownerDocument.parentWindow;

                if (event.shiftKey) {
                    this.mimicNextHistory(elWindow);
                } else {
                    this.mimicPreviousHistory(elWindow);
                }
            }
        },

        mimicPreviousHistory : function (global) {
            global.history.back();
        },

        mimicNextHistory : function (global) {
            global.history.forward();
        },

        mimicOptionSelect : function (optionNode) {
            var select   = this.$(optionNode).closest('select')[0];
            var oldValue = select.value;

            select.value = optionNode.value;

            if (oldValue !== optionNode.value) {
                this.simulateEvent(select, "change");
            }
        }
    }
});
