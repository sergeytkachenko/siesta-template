/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

 @class Siesta.Test.TextSelection

 This is a mixin providing text selection functionality.

 */
Role('Siesta.Test.TextSelection', {

    methods : {
        /**
         * Utility method which returns the selected text in the passed element or in the document
         * @param {Siesta.Test.ActionTarget} el The element
         * @return {String} The selected text
         */
        getSelectedText : function (el) {
            el      = this.normalizeElement(el);

            if ('selectionStart' in el) {
                try {
                    return el.value.substring(el.selectionStart, el.selectionEnd);
                } catch (e) {
                    // the "email" and "number" input fields (possibly some other too) does not allow to access 
                    // the "selectionStart/End" properties and throws exceptions
                }
            }

            var win = this.global,
                doc = win.document;

            if (win.getSelection) {
                return win.getSelection().toString();
            } else if (doc.getSelection) {
                return doc.getSelection();
            } else if (doc.selection) {
                return doc.selection.createRange().text;
            }
        },

        /**
         * Utility method which selects text in the passed element (should be an &lt;input&gt; element).
         * @param {Siesta.Test.ActionTarget} el The element
         * @param {Int} start (optional) The selection start index
         * @param {Int} end (optional) The selection end index
         */
        selectText : function (el, start, end, callback) {
            el          = this.normalizeElement(el);

            var v       = el.value || el.innerHTML,
                doFocus = true;

            if (v.length > 0) {
                start   = start === undefined ? 0 : start;
                end     = end === undefined ? v.length : end;

                if (el.setSelectionRange) {
                    try {
                        // can throw exception in IE9 (if element is not visible)
                        el.setSelectionRange(start, end);
                    } catch (e) {
                    }
                } else if (el.createTextRange) {
                    var R = el.createTextRange();

                    R.moveStart('character', start);
                    R.moveEnd('character', end - v.length);

                    R.select();
                }

                doFocus = bowser.gecko || bowser.opera;
            }

            if (doFocus) {
                this.focus(el);
            }

            callback && callback.call(this);
        },

        // Returns undefined if caret pos cannot be determined (older IEs with contentEditable)
        getCaretPosition : function (el) {
            var pos;
            
            var win         = this.global;
            var document    = win.document;

            if ('selectionStart' in el) {
                pos         = el.selectionStart;
            } else if (win.getSelection && this.isEditableNode(el)){
                var sel     = win.getSelection();

                if (sel.rangeCount) {
                    var range = sel.getRangeAt(0);

                    if (range.commonAncestorContainer.parentNode == el) {
                        pos = range.endOffset;
                    }
                }
            } else if (document.selection) { // Legacy IE
                el.focus();

                var oSel    = document.selection.createRange();

                oSel.moveStart('character', -el.value.length);

                pos         = oSel.text.length;
            }

            return pos;
        },

        
        setCaretPosition : function (el, caretPos) {
            if (el.createTextRange) {
                var range = el.createTextRange();
                
                range.move('character', caretPos);
                range.select();
            } else {
                
                if (el.setSelectionRange) {
                    el.focus();
                    el.setSelectionRange(caretPos, caretPos);
                } else {
                    el.focus();
                }
            }
        }
    }
})
