/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Simulate.Keyboard

This is a mixin, providing the keyboard events simulation functionality.


*/

//        Copyright (c) 2011 John Resig, http://jquery.com/

//        Permission is hereby granted, free of charge, to any person obtaining
//        a copy of this software and associated documentation files (the
//        "Software"), to deal in the Software without restriction, including
//        without limitation the rights to use, copy, modify, merge, publish,
//        distribute, sublicense, and/or sell copies of the Software, and to
//        permit persons to whom the Software is furnished to do so, subject to
//        the following conditions:

//        The above copyright notice and this permission notice shall be
//        included in all copies or substantial portions of the Software.

//        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//        EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//        NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//        LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//        OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//        WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


Role('Siesta.Test.Simulate.Keyboard', {

    requires        : [ 'simulateEvent', 'getSimulateEventsWith', 'getElementAtCursor' ],

    does : [
        Siesta.Util.Role.CanFormatStrings
    ],

    has : {
        eventName           : "KeyboardEvent" in window ? "KeyboardEvent" : ("KeyEvent" in window ? "KeyEvents" : null)
    },

    methods: {

        // TODO switch to KeyboardEvent https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent
        // private
        createKeyboardEvent: function (type, options, el) {
            var event;
            var doc = el.ownerDocument,
                global = this.global;

            options = $.extend({
                bubbles    : true,
                cancelable : true,
                view       : this.global,
                ctrlKey    : false,
                altKey     : false,
                shiftKey   : false,
                metaKey    : false,
                keyCode    : 0,
                charCode   : 0
            }, options);

            // use W3C standard when available and allowed by "simulateEventsWith" option
            if (doc.createEvent && this.getSimulateEventsWith() == 'dispatchEvent') {
                try {
                    event = doc.createEvent(this.eventName);
                    event.initKeyEvent(type, options.bubbles, options.cancelable, options.view, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.keyCode, options.charCode);
                } catch (err) {
                    event = doc.createEvent("Events");
                    event.initEvent(type, options.bubbles, options.cancelable);
                    $.extend(event, { view: options.view,
                        ctrlKey: options.ctrlKey, altKey: options.altKey, shiftKey: options.shiftKey, metaKey: options.metaKey,
                        keyCode: options.keyCode, charCode: options.charCode
                    });
                }
            } else if (doc.createEventObject) {
                event = doc.createEventObject();
                $.extend(event, options);
            }

            if (bowser.msie || bowser.opera) {
                event.keyCode = (options.charCode > 0) ? options.charCode : options.keyCode;
                event.charCode = undefined;
            }

            return event;
        },

        // private
        createTextEvent: function (type, options, el) {
            var doc         = el.ownerDocument;
            var event       = null;

            // only for Webkit / IE for now
            if (doc.createEvent) {
                try {
                    event = doc.createEvent('TextEvent');

                    if (event && event.initTextEvent) {
                        event.initTextEvent(
                            type,
                            true,
                            true,
                            this.global,
                            options.text,
                            // IE ONLY below here
                            0,
                            window.navigator.userLanguage || window.navigator.language
                        );
                        return event;
                    }
                }
                catch(e) {}
            }

            return null;
        },


        /*!
         * Based on:
         * 
         * @license EmulateTab
         * Copyright (c) 2011, 2012 The Swedish Post and Telecom Authority (PTS)
         * Developed for PTS by Joel Purra <http://joelpurra.se/>
         * Released under the BSD license.
         *
         * A jQuery plugin to emulate tabbing between elements on a page.
         */
        findNextFocusable : function (el, offset) {
            var $el         = this.$(el)

            var $focusable  = this.$(":focus, :input, a[href], [tabindex], body", el.ownerDocument)
                .not(":disabled")
                .not(":hidden")
                .not("a[href]:empty")


            var escapeSelectorName  = function (str) {
                // Based on http://api.jquery.com/category/selectors/
                // Still untested
                return str.replace(/(!"#$%&'\(\)\*\+,\.\/:;<=>\?@\[\]^`\{\|\}~)/g, "\\\\$1");
            }

            var isRadio     = false
            var selector

            if (el.tagName === "INPUT" && el.type === "radio" && el.name !== "" ) {
                isRadio     = true
                selector    = "input[type=radio][name=" + escapeSelectorName(el.name) + "]"
            }

            var processed       = []

            for (var i = 0; i < $focusable.length; i++) {
                var currEl      = $focusable[ i ]

                // always include current element 
                if (currEl != el && currEl.getAttribute('tabIndex') == -1 || isRadio && $(currEl).is(selector)) continue

                processed.push(currEl)
            }

            var body                = el.ownerDocument.body
            var currentTabIndex     = el.getAttribute('tabIndex')

            var getTabIndex         = function (dom) {
                if (dom == el && currentTabIndex == -1) return 0

                if (dom == body) return 0

                return dom.getAttribute('tabIndex') || 0
            }

            processed.sort(function (a, b) {
                var aIndex      = getTabIndex(a)
                var bIndex      = getTabIndex(b)

                return aIndex < bIndex ? -1 : (aIndex > bIndex ? 1 : (a == body ? 1 : (b == body ? -1 : 0)))
            });

            var currentIndex    = $(processed).index($el);

            if (currentIndex == -1) return null

            return processed[ (currentIndex + offset) % processed.length ]
        },


        emulateTab : function (el, offset) {
            var next        = this.findNextFocusable(el, offset || 1)

            if (next)
                this.focus(next)
            else
                el.blur()

            return next
        },


        /**
        * This method will simulate keyboard typing on either a provided DOM element, or if omitted on the currently focuced DOM element.
        * Simulation of certain special keys such as ENTER, ESC, LEFT etc is supported.
        * You can type these special keys by using the all uppercase name the key inside square brackets. See {@link Siesta.Test.Simulate.KeyCodes} for a list
        * of key names.
        *
        * For example:
        *

    t.type(el, 'Foo bar[ENTER]', function () {
        ...
    })

    // With extra options as the last argument
    t.type(el, 'Foo bar[ENTER]', callback, scope, { shiftKey : true, altKey : true });
        *
        * The following events will be fired, in order: `keydown`, `keypress`, `keyup`
        *
        * @param {Siesta.Test.ActionTarget} el The element to type into
        * @param {String} text The text to type, including any names of special keys in square brackets.
        * @param {Function} callback (optional) To run this method async, provide a callback method to be called after the type operation is completed.
        * @param {Object} scope (optional) the scope for the callback
        * @param {Object} options (optional) any extra options used to configure the DOM key events (like holding shiftKey, ctrlKey, altKey etc).
        * @param {Boolean} clearExisting (optional) true to clear existing text in the target before typing
         */
        type : function (el, text, callback, scope, options, clearExisting, performTargetCheck) {
            // Skip target check if user is simply targeting whatever is focused
            if (!el) performTargetCheck = false;

            el              = el || this.activeElement();

            if (performTargetCheck !== false && callback) {
                this.waitForTargetAndSyncMousePosition(el, null, this.type, [el, text, callback, scope, options, clearExisting, false], false, false);
                return;
            }

            el              = this.normalizeElement(el);

            if (text == null) throw 'Must supply a string to type';

            if (!el) {
                // No point in continuing
                callback && callback.call(scope || this);
                return;
            }

            var me          = this

            if (el.disabled) {
                me.processCallbackFromTest(callback, null, scope || me)

                return;
            }

            if (clearExisting) {
                el.value    = ''
            }

            // Extract normal chars, or special keys in brackets such as [TAB], [RIGHT] or [ENTER]			
            var keys        = this.extractKeysAndSpecialKeys(text + '');

            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,

                interval        : this.actionDelay,
                callbackDelay   : this.afterActionDelay,

                observeTest     : this,

                processor       : function (data, index) {
                    // 1. In IE10, it seems activeElement cannot be trusted as it sometimes returns an empty object with no properties.
                    // Try to detect this case and simply use the original el 
                    // 2. If user clicks around in the harness during ongoing test, the activeElement will be reset to BODY
                    // If this happens, reuse the original el and hope all is well
                    var focusedEl   = me.activeElement(true, el, el)

                    me.keyPress(focusedEl, data.key, options)
                }
            })

            // Manually focus event to be typed into first
            queue.addStep({
                processor       : function () {
                    me.focus(el)
                }
            })

            // focus the element one more time for IE - this seems to fix the weird sporadic failures in 042_keyevent_simulation3.t.js
            // failures are caused by the field "blur" immediately after 1st focus
            // no Ext "focus/blur" methods seems to be called, so it can be a browser behavior
            bowser.msie && queue.addStep({
                processor       : function () {
                    me.focus(el)
                }
            })

            jQuery.each(keys, function (index, key) {
                key             = key.length == 1 ? key : key.substring(1, key.length - 1)

                keys[ index ]   = key

                queue.addStep({ key : key })
            });

            if (keys.length) {
                var KeyCodes        = Siesta.Test.Simulate.KeyCodes().keys;
                var firstKeyCode    = KeyCodes[ keys[ 0 ].toUpperCase() ]

                if (this.isReadableKey(firstKeyCode)) {
                    // Some browsers (IE/FF) do not overwrite selected text, do it manually
                    // but only if the key is readable (some letter etc)
                    // do not clear the selection in case of special symbol
                    var selText     = this.getSelectedText(el);

                    if (selText) {
                        el.value    = el.value.replace(selText, '');
                    }
                }
            }

            var async       = this.beginAsync();

            queue.run(function () {
                me.endAsync(async)

                me.processCallbackFromTest(callback, null, scope || me)
            })
        },

        /**
        * @param {Siesta.Test.ActionTarget} el
        * @param {String} key
        * @param {Object} options any extra options used to configure the DOM event
        *
        * This method will simluate the key press, translated to the specified DOM element.
        * The following events will be fired, in order: `keydown`, `keypress`, `textInput`(webkit only currently), `keyup`
        */
        keyPress: function (el, key, options, callback) {
            var isMac           = navigator.platform.indexOf('Mac') > -1;
            var KeyCodes        = Siesta.Test.Simulate.KeyCodes().keys
            var keyCode         = KeyCodes[ key.toUpperCase() ] || 0;

            el                  = this.normalizeElement(el);

            if (typeof options === 'function') {
                callback = options;
                options  = undefined;
            }

            options             = options || {};

            options.readableKey = key;

            // keypress should not be fired on Mac when CMD is pressed
            // nor on Windows when CTRL is pressed
            var ctrlOrCmdPressed = (isMac && options.metaKey) || (!isMac && options.ctrlKey);

            // Should not actually type anything when CTRL / CMD are pressed
            var isReadableKey   = this.isReadableKey(keyCode) && !ctrlOrCmdPressed

            var charCode        = isReadableKey ? key.charCodeAt(0) : 0

            var me              = this,
                isTextInput     = me.isTextInput(el),
                isEditableNode  = me.isEditableNode(el),
                acceptsTextInput = isTextInput || isEditableNode;

            var keyDownEvent     = me.simulateEvent(el, 'keydown', $.extend({ charCode : 0, keyCode : keyCode }, options));
            var keyDownPrevented = this.isEventPrevented(keyDownEvent)
            var isSelection      = acceptsTextInput && this.mimicTextSelection(keyDownEvent, el);

            if (!isSelection) {
                var prevented       = false;
                var supports        = Siesta.Harness.Browser.FeatureSupport().supports

                // Need to reevaluate focused element here, it may have changed in a 'keydown' listener
                el                  = me.activeElement(true, el, el);

                // keypress should not be fired when CTRL or CMD are pressed
                if (!ctrlOrCmdPressed) {
                    var event       = me.simulateEvent(el, 'keypress', $.extend({ charCode : charCode, keyCode : isReadableKey ? 0 : keyCode }, options));
                    prevented       = this.isEventPrevented(event)

                    if (!keyDownPrevented && !prevented && keyCode === KeyCodes.TAB) {
                        el              = this.emulateTab(el, options.shiftKey ? -1 : 1) || el;
                    }
                }

                if (!prevented && acceptsTextInput && keyCode != KeyCodes.TAB) {
                    var isPhantomJS = this.harness.isPhantomJS
                    var textValueProp = 'value' in el ? 'value' : 'innerHTML';

                    if (isReadableKey) {
                        // PhantomJS does not simulate the "textInput" event correctly if target element is inside an iframe
                        // (at least not as of 1.6), only the last character is shown.
                        if (!isPhantomJS) {
                            var innerHTML

                            // IE10 tries to be 'helpful' by inserting an empty space, clean it
                            // IE11 inserts <br> after call to the .focus() method of the element
                            if (isEditableNode && bowser.msie) {
                                innerHTML               = el.innerHTML

                                if (innerHTML.indexOf('&nbsp;') === 0)
                                    el.innerHTML        = innerHTML.substring(6)
                                else
                                    if (innerHTML.indexOf('<br>') === 0)
                                        el.innerHTML    = innerHTML.substring(4);
                            }

                            // IE won't do execCommand with insertText
                            if (isEditableNode && !bowser.msie) {
                                innerHTML           = el.innerHTML

                                if (innerHTML.charCodeAt(innerHTML.length - 1) === 8203) {
                                    el.innerHTML    = innerHTML.substring(0, innerHTML.length - 1);
                                }
                                el.ownerDocument.execCommand('insertText', false, options.readableKey);
                            } else {
                                 //TODO should check first if textInput event is supported
                                me.simulateEvent(el, bowser.msie ? 'textinput' : 'textInput', { text: options.readableKey });
                            }
                        }

                        me.mimicCharacterInsertion(el, key);

                        me.simulateEvent(el, 'input', options);
                    } else {
                        me.mimicCaretMovement(el, keyCode);
                    }

                    // Manually delete one char off the end if backspace simulation is not supported by the browser
                    if ((keyCode === KeyCodes.BACKSPACE || keyCode === KeyCodes.DELETE)&& !supports.canSimulateBackspace && el[ textValueProp ].length > 0) {
                        this.mimicCharacterDeletion(el, keyCode);
                    }

                    if (textValueProp === 'value' && keyCode === KeyCodes.ENTER && !supports.enterSubmitsForm) {
                        this.mimicFormSubmit(el);
                    }
                }
            }

            this.mimicClickOnEnter(el, keyCode);

            me.simulateEvent(el, 'keyup', $.extend({ charCode : 0, keyCode : keyCode }, options));

            callback && callback.call(this);
        },


        isTextInput : function(node) {
            // somehow "node.nodeName" is empty sometimes in IE10
            var name    = node.nodeName && node.nodeName.toLowerCase();

            if (name === 'textarea') return true;

            if (name === 'input' && node.type && node.type.toLowerCase()) {
                var type    = node.type && node.type.toLowerCase();

                return   type === 'password'    ||
                         type === 'number'      ||
                         type === 'search'      ||
                         type === 'text'        ||
                         type === 'url'         ||
                         type === 'tel'         ||
                         type === 'month'       ||
                         type === 'time'        ||
                         type === 'date'        ||
                         type === 'datetime'    ||
                         type === 'week'        ||
                         type === 'email';
            }
        },

        isEditableNode : function(node) {
            return node.ownerDocument.designMode.toLowerCase() === 'on' ||
                   node.isContentEditable;
        },

        // private
        isReadableKey: function (keyCode) {
            var KC = Siesta.Test.Simulate.KeyCodes();

            return !KC.isNav(keyCode) && !KC.isSpecial(keyCode);
        },

        mimicCharacterInsertion : function(el, readableKey) {
            var textValueProp   = 'value' in el ? 'value' : 'innerHTML';
            var originalLength  = el[ textValueProp ].length;
            var maxLength       = el.getAttribute('maxlength') || Infinity
            var isTextInput     = this.isTextInput(el);
            var supports        = Siesta.Harness.Browser.FeatureSupport().supports;

            if (maxLength != null) maxLength    = Number(maxLength)

            // If the entered char had no impact on the textfield - manually put it there
            if (!el.readOnly && (isTextInput || bowser.msie) && (!supports.canSimulateKeyCharacters || this.harness.isPhantomJS) && originalLength === el[ textValueProp ].length && originalLength < maxLength) {
                var val      = el[ textValueProp ];
                var caretPos = this.getCaretPosition(el);

                // Fallback to appending text to end of string if caret position cannot be determined
                if (caretPos === undefined) {
                    caretPos = val.length;
                }

                // Inject char at caret position
                el[ textValueProp ] = val.substr(0, caretPos) + readableKey + val.substr(caretPos);

                // Restore caret position
                this.setCaretPosition(el, caretPos + 1);
            }
        },

        mimicTextSelection : function(keyDownEvent, el) {
            var KC          = Siesta.Test.Simulate.KeyCodes().keys;
            var isMac       = navigator.platform.indexOf('Mac') > -1;
            var retVal      = false;

            // CTRL-A or CMD-A in text input should select all
            var ctrlKey = (!isMac && keyDownEvent.ctrlKey) || (keyDownEvent.metaKey && isMac);

            switch(keyDownEvent.keyCode) {
                // Select all
                case KC["A"]:
                    if (ctrlKey) {
                        this.selectText(el);
                        retVal = true;
                    }
                    break;

                case KC["LEFT"]:
                case KC["HOME"]:
                    if (keyDownEvent.shiftKey) {
                        this.selectText(el, 0, this.getCaretPosition(el));
                        retVal = true;
                    }
                    break;

                case KC["RIGHT"]:
                case KC["END"]:
                    if (keyDownEvent.shiftKey) {
                        this.selectText(el, this.getCaretPosition(el));
                        retVal = true;
                    }
                    break;
            }

            return retVal;
        },

        mimicClickOnEnter : function(el, keyCode) {
            // somehow "node.nodeName" is empty sometimes in IE10
            var nodeName        = el.nodeName && el.nodeName.toLowerCase()
            var supports        = Siesta.Harness.Browser.FeatureSupport().supports
            var KeyCodes        = Siesta.Test.Simulate.KeyCodes().keys

            if ((nodeName == 'a' || nodeName == 'button') && keyCode === KeyCodes.ENTER && !supports.enterOnAnchorTriggersClick) {
                // this "click" should not update the current cursor position its merely for activating "click" listeners
                this.simulateEvent(el, 'click', { doNotUpdateCurrentPosition : true });
            }
        },

        mimicCaretMovement : function(el, keyCode) {
            // somehow "node.nodeName" is empty sometimes in IE10
            var nodeName        = el.nodeName && el.nodeName.toLowerCase()

            if ((nodeName == 'input' || nodeName == 'textarea')) {
                var KeyCodes        = Siesta.Test.Simulate.KeyCodes().keys;

                switch (keyCode) {
                    case KeyCodes.HOME:
                        this.setCaretPosition(el, 0);
                        break;

                    case KeyCodes.END:
                        this.setCaretPosition(el, el.value.length);
                        break;
                }
            }
        },

        mimicFormSubmit : function (el) {
            var form        = this.$(el).closest('form');

            if (form.length) {
                // Use jQuery's :submit instead of [type=submit] since <button>Foo</button> could have button.type=submit, but this is not queryable
                var submitButton = form.find(':submit')[ 0 ];
                var hasOneInput  = form.find('input').length === 1;

                if (submitButton) {
                    submitButton.click();
                }
                else if (hasOneInput) {
                    var submitPrevented = this.isEventPrevented(this.simulateEvent(form[ 0 ], 'submit', {}));

                    if (!submitPrevented) form[ 0 ].submit();
                }
            }
        },

        mimicCharacterDeletion : function (el, keyCode) {
            var isTextInput     = this.isTextInput(el);

            // IE won't do execCommand with insertText
            if (isTextInput || bowser.msie) {
                var textValueProp    = 'value' in el ? 'value' : 'innerHTML';
                var nbrCharsToDelete = 1;
                var text             = el[ textValueProp ];
                var selText          = this.getSelectedText(el) || '';
                var caretPosition    = this.getCaretPosition(el);

                if (caretPosition !== undefined && selText) {
                    el[ textValueProp ]    = text.substring(0, caretPosition) + text.substring(caretPosition + selText.length);

                    caretPosition   = caretPosition;
                } else {
                    var KeyCodes    = Siesta.Test.Simulate.KeyCodes().keys;

                    // fall back to last char index if caret position could not be determined
                    caretPosition   = caretPosition === undefined ? text.length : caretPosition;

                    if (keyCode === KeyCodes.BACKSPACE) {
                        el[ textValueProp ]    = text.substring(0, caretPosition - 1) + text.substring(caretPosition);

                        caretPosition = caretPosition - 1;
                    } else {
                        // DELETE key
                        el[ textValueProp ] = (caretPosition > 0 ? text.substring(0, caretPosition + 1) : '') + text.substring(caretPosition + 1);
                    }
                }

                // Caret position is moved to end when setting text value, restore it manually
                this.setCaretPosition(el, caretPosition);
            } else {
                el.ownerDocument.execCommand('delete');
            }
        }
    }
});


