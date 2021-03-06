/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Ext.ux.form.field.CodeMirror', {
    extend             : 'Ext.Component',

    alias              : 'widget.jseditor',
    alternateClassName : 'Ext.form.CodeMirror',
    requires           : [
        'Ext.tip.QuickTipManager',
        'Ext.toolbar.Item',
        'Ext.util.Format'
    ],

    width : '100%',

    /**
     * @cfg {String} mode The default mode to use when the editor is initialized. When not given, this will default to the first mode that was loaded.
     * It may be a string, which either simply names the mode or is a MIME type associated with the mode. Alternatively,
     * it may be an object containing configuration options for the mode, with a name property that names the mode
     * (for example {name: "javascript", json: true}). The demo pages for each mode contain information about what
     * configuration parameters the mode supports.
     */
    mode : 'text/javascript',

    /**
     * @cfg {Boolean} showLineNumbers Enable line numbers button in the toolbar.
     */
    showLineNumbers : true,

    /**
     * @cfg {Boolean} enableMatchBrackets Force matching-bracket-highlighting to happen
     */
    enableMatchBrackets : true,

    /**
     * @cfg {Boolean} enableElectricChars Configures whether the editor should re-indent the current line when a character is typed
     * that might change its proper indentation (only works if the mode supports indentation).
     */
    enableElectricChars : false,

    /**
     * @cfg {Boolean} enableIndentWithTabs Whether, when indenting, the first N*tabSize spaces should be replaced by N tabs.
     */
    enableIndentWithTabs : true,

    /**
     * @cfg {Boolean} enableSmartIndent Whether to use the context-sensitive indentation that the mode provides (or just indent the same as the line before).
     */
    enableSmartIndent : true,

    /**
     * @cfg {Boolean} enableLineWrapping Whether CodeMirror should scroll or wrap for long lines.
     */
    enableLineWrapping : false,

    /**
     * @cfg {Boolean} enableLineNumbers Whether to show line numbers to the left of the editor.
     */
    enableLineNumbers : true,


    /**
     * @cfg {Boolean} enableFixedGutter When enabled (off by default), this will make the gutter stay visible when the
     * document is scrolled horizontally.
     */
    enableFixedGutter : false,

    /**
     * @cfg {Number} firstLineNumber At which number to start counting lines.
     */
    firstLineNumber : 1,

    /**
     * @cfg {Boolean} readOnly <tt>true</tt> to mark the field as readOnly.
     */
    readOnly : false,

    /**
     * @cfg {Number} pollInterval Indicates how quickly (miliseconds) CodeMirror should poll its input textarea for changes.
     * Most input is captured by events, but some things, like IME input on some browsers, doesn't generate events
     * that allow CodeMirror to properly detect it. Thus, it polls.
     */
    pollInterval : 100,

    /**
     * @cfg {Number} indentUnit How many spaces a block (whatever that means in the edited language) should be indented.
     */
    indentUnit : 4,

    /**
     * @cfg {Number} tabSize The width of a tab character.
     */
    tabSize : 4,

    /**
     * @cfg {String} theme The theme to style the editor with. You must make sure the CSS file defining the corresponding
     * .cm-s-[name] styles is loaded (see the theme directory in the distribution). The default is "default", for which
     * colors are included in codemirror.css. It is possible to use multiple theming classes at once—for example
     * "foo bar" will assign both the cm-s-foo and the cm-s-bar classes to the editor.
     */
    theme : 'default',

    scriptsLoaded : [],
    lastMode      : '',

    initComponent : function () {
        var me = this;

        //me.addEvents(
        /**
         * @event initialize
         * Fires when the editor is fully initialized (including the iframe)
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'initialize',
        /**
         * @event activate
         * Fires when the editor is first receives the focus. Any insertion must wait
         * until after this event.
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'activate',
        /**
         * @event deactivate
         * Fires when the editor looses the focus.
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'deactivate',
        /**
         * @event change
         * Fires when the content of the editor is changed.
         * @param {Ext.ux.form.field.CodeMirror} this
         * @param {String} newValue New value
         * @param {String} oldValue Old value
         * @param {Array} options
         */
        //'change',

        /**
         * @event cursoractivity
         * Fires when the cursor or selection moves, or any change is made to the editor content.
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'cursoractivity',
        /**
         * @event gutterclick
         * Fires whenever the editor gutter (the line-number area) is clicked.
         * @param {Ext.ux.form.field.CodeMirror} this
         * @param {Number} lineNumber Zero-based number of the line that was clicked
         * @param {Object} event The raw mousedown event
         */
        //'gutterclick',
        /**
         * @event scroll
         * Fires whenever the editor is scrolled.
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'scroll',
        /**
         * @event highlightcomplete
         * Fires whenever the editor's content has been fully highlighted.
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'highlightcomplete',
        /**
         * @event update
         * Fires whenever CodeMirror updates its DOM display.
         * @param {Ext.ux.form.field.CodeMirror} this
         */
        //'update',
        /**
         * @event keyevent
         * Fires on eery keydown, keyup, and keypress event that CodeMirror captures.
         * @param {Ext.ux.form.field.CodeMirror} this
         * @param {Object} event This key event is pretty much the raw key event, except that a stop() method is always
         * added to it. You could feed it to, for example, jQuery.Event to further normalize it. This function can inspect
         * the key event, and handle it if it wants to. It may return true to tell CodeMirror to ignore the event.
         * Be wary that, on some browsers, stopping a keydown does not stop the keypress from firing, whereas on others
         * it does. If you respond to an event, you should probably inspect its type property and only do something when
         * it is keydown (or keypress for actions that need character data).
         */
        //'keyevent'
        //);

        me.callParent(arguments);


        /*
         Fix resize issues as suggested by user koblass on the Extjs forums
         http://www.sencha.com/forum/showthread.php?167047-Ext.ux.form.field.CodeMirror-for-Ext-4.x&p=860535&viewfull=1#post860535
         */
        me.on('resize', function () {
            if (me.editor) {
                me.editor.refresh();
            }
        }, me);

    },

    resetOriginalValue : Ext.emptyFn,

    isValid : function() {
        var errors = this.getErrors() || [];

        return errors.length === 0;
    },

    /**
     * @private override
     */
    afterRender : function () {
        var me = this;

        me.callParent(arguments);

        me.initEditor();
    },

    /**
     * @private override
     */
    initEditor : function () {
        var me = this,
            mode = 'javascript';


        me.editor = CodeMirror(me.el.dom, {
            matchBrackets       : me.enableMatchBrackets,
            electricChars       : me.enableElectricChars,
            autoClearEmptyLines : true,
            indentUnit          : me.indentUnit,
            smartIndent         : me.enableSmartIndent,
            indentWithTabs      : me.indentWithTabs,
            pollInterval        : me.pollInterval,
            lineNumbers         : me.enableLineNumbers,
            lineWrapping        : me.enableLineWrapping,
            firstLineNumber     : me.firstLineNumber,
            tabSize             : me.tabSize,
            gutters             : ["CodeMirror-lint-markers"],
            fixedGutter         : me.enableFixedGutter,
            theme               : me.theme,
            mode                : mode,
            lintWith            : CodeMirror.javascriptValidatorWithOptions({
                "onecase"  : true,
                "asi"      : true,
                "expr"     : true,         // allow fn && fn()
                "loopfunc" : true,
                "laxbreak" : true,
                "debug"    : true,
                "laxcomma" : true,
                smarttabs  : true
            }),

            onChange            : function (editor, tc) {
                me.checkValid();
                //me.last-child();
                //me.fireEvent('change', me, tc.from, tc.to, tc.text, tc.next || null);
            },
            onCursorActivity    : function (editor) {
                me.fireEvent('cursoractivity', me);
            },
            onGutterClick       : function (editor, line, event) {
                me.fireEvent('gutterclick', me, line, event);
            },
            onFocus             : function (editor) {
                me.fireEvent('activate', me);
            },
            onBlur              : function (editor, e) {
                me.fireEvent('deactivate', me);
                me.onBlur(e);
            },
            onScroll            : function (editor) {
                me.fireEvent('scroll', me);
            },
            onHighlightComplete : function (editor) {
                me.fireEvent('highlightcomplete', me);
            },
            onUpdate            : function (editor) {
                me.fireEvent('update', me);
            },
            onKeyEvent          : function (editor, event) {
                event.cancelBubble = true; // fix suggested by koblass user on Sencha forums (http://www.sencha.com/forum/showthread.php?167047-Ext.ux.form.field.CodeMirror-for-Ext-4.x&p=862029&viewfull=1#post862029)
                me.fireEvent('keyevent', me, event);
            }

        });

        //me.editor.setValue(me.rawValue);
//        me.setMode(me.mode);
        me.setReadOnly(me.readOnly);
        me.fireEvent('initialize', me);

        // change the codemirror css
        var css = Ext.util.CSS.getRule('.CodeMirror');
        if (css) {
            css.style.height = '100%';
            css.style.position = 'relative';
            css.style.overflow = 'hidden';
        }
        var css = Ext.util.CSS.getRule('.CodeMirror-Scroll');
        if (css) {
            css.style.height = '100%';
        }

    },

    checkValid : function() {
        var errors = this.getErrors() || [];

        if (errors.length > 0) {
            this.addCls('siesta-invalid-syntax');
        } else {
            this.removeCls('siesta-invalid-syntax');
        }
    },

    getErrors : function() {

    },

    /**
     * @private
     */
    relayBtnCmd : function (btn) {
        this.relayCmd(btn.getItemId());
    },

    /**
     * @private
     */
    relayCmd : function (cmd) {
        Ext.defer(function () {
            var me = this;
            me.editor.focus();
            switch (cmd) {
                // auto formatting
                case 'justifycenter':
                    if (!CodeMirror.extensions.autoIndentRange) {
                        me.loadDependencies(me.extensions.format, me.pathExtensions, me.doIndentSelection, me);
                    } else {
                        me.doIndentSelection();
                    }
                    break;

                // line numbers
                case 'insertorderedlist':
                    me.doChangeLineNumbers();
                    break;
            }
        }, 10, this);
    },


    doChangeLineNumbers : function () {
        var me = this;

        me.enableLineNumbers = !me.enableLineNumbers;
        me.editor.setOption('lineNumbers', me.enableLineNumbers);
    },

    /**
     * @private
     */
    doIndentSelection : function () {
        var me = this;

        me.reloadExtentions();

        try {
            var range = { from : me.editor.getCursor(true), to : me.editor.getCursor(false) };
            me.editor.autoIndentRange(range.from, range.to);
        } catch (err) {
        }
    },


    /**
     * Set the editor as read only
     *
     * @param {Boolean} readOnly
     */
    setReadOnly : function (readOnly) {
        var me = this;

        if (me.editor) {
            me.editor.setOption('readOnly', readOnly);
        }
    },

    onDisable : function () {
        this.bodyEl.mask();
        this.callParent(arguments);
    },

    onEnable : function () {
        this.bodyEl.unmask();
        this.callParent(arguments);
    },


    /**
     * Sets a data value into the field and runs the change detection.
     * @param {Mixed} value The value to set
     * @return {Ext.ux.form.field.CodeMirror} this
     */
    setValue : function (value) {
        value = value || '';

        var me = this;
//        me.mixins.field.setValue.call(me, value);
//        me.rawValue = value;
        if (me.editor) {
            me.editor.setValue(value);
        }
        return me;
    },

    /**
     * Return submit value to the owner form.
     * @return {Mixed} The field value
     */
    getSubmitValue : function () {
        var me = this;
        return me.getValue();
    },

    getRawValue : function () {
        return this.getValue();
    },

    /**
     * Return the value of the CodeMirror editor
     * @return {Mixed} The field value
     */
    getValue : function () {
        var me = this;

        if (me.editor)
            return me.editor.getValue() || '';
        else
            return '';
    },

    /**
     * @private
     */
    onDestroy : function () {
        var me = this;
        if (me.rendered) {

            for (var prop in me.editor) {
                if (me.editor.hasOwnProperty(prop)) {
                    delete me.editor[prop];
                }
            }
            Ext.destroyMembers('tb', 'toolbarWrap', 'editorEl');
        }
        me.callParent();
    },

    commentLine : function () {
        var editor = this.editor;
        var start = editor.getCursor(true);
        var end = editor.getCursor(false);
        var currentLine = start.line;
        var doFormat = false;

        function toggleCommented(line) {
            text = editor.getLine(line);
            if (text.match(/^\s*\/\/\s*/)) {
                text = text.replace(/\s*\/\/\s*/, '');
                doFormat = true;
            } else {
                text = text.substr(0, text.indexOf(Ext.String.trim(text))) + '// ' + Ext.String.trim(text);
            }
            editor.setLine(line, text);
        }

        if (start.line === end.line && start.ch === end.ch) {
            toggleCommented(start.line);
        } else if (start.character == 0) {
            while (currentLine != end.line) {
                toggleCommented(currentLine);
                currentLine = editor.getLine(++currentLine);
            }
            editor.selectLines(start.line, start.ch, end.line, end.ch);
        } else {
            var text = editor.getSelection();
            var diff = 1;
            if (text.match(/^\/\*/) && text.match(/^\/\*/)) {
                text = text.substring(2, text.length - 2);
                diff = -1;
                doFormat = true;
            } else {
                text = "/*" + text + "*/";
            }
            editor.replaceSelection(text);

            // following line crash
//            if (start.line == end.line) {
//                editor.setSelection(start.line, start.ch, end.line, end.ch+(diff*4));
//            } else {
//                editor.setSelection(start.line, start.ch, end.line, end.ch+(diff*2));
//            }
        }

        if (doFormat) {
            editor.autoIndentRange({ line : 0 }, { line : editor.lineCount() });
        }
    }

});
//
//(function () {
//    CodeMirror.extendMode("css", {
//        commentStart      : "/*",
//        commentEnd        : "*/",
//        newlineAfterToken : function (type, content) {
//            return /^[;{}]$/.test(content);
//        }
//    });
//
//    CodeMirror.extendMode("javascript", {
//        commentStart      : "/*",
//        commentEnd        : "*/",
//        // FIXME semicolons inside of for
//        newlineAfterToken : function (type, content, textAfter, state) {
//            if (this.jsonMode) {
//                return /^[\[,{]$/.test(content) || /^}/.test(textAfter);
//            } else {
//                if (content == ";" && state.lexical && state.lexical.type == ")") return false;
//                return /^[;{}]$/.test(content) && !/^;/.test(textAfter);
//            }
//        }
//    });
//
//    CodeMirror.extendMode("xml", {
//        commentStart      : "<!--",
//        commentEnd        : "-->",
//        newlineAfterToken : function (type, content, textAfter) {
//            return type == "tag" && />$/.test(content) || /^</.test(textAfter);
//        }
//    });
//
//    // Comment/uncomment the specified range
//    CodeMirror.defineExtension("commentRange", function (isComment, from, to) {
//        var cm = this, curMode = CodeMirror.innerMode(cm.getMode(), cm.getTokenAt(from).state).mode;
//        cm.operation(function () {
//            if (isComment) { // Comment range
//                cm.replaceRange(curMode.commentEnd, to);
//                cm.replaceRange(curMode.commentStart, from);
//                if (from.line == to.line && from.ch == to.ch) // An empty comment inserted - put cursor inside
//                    cm.setCursor(from.line, from.ch + curMode.commentStart.length);
//            } else { // Uncomment range
//                var selText = cm.getRange(from, to);
//                var startIndex = selText.indexOf(curMode.commentStart);
//                var endIndex = selText.lastIndexOf(curMode.commentEnd);
//                if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
//                    // Take string till comment start
//                    selText = selText.substr(0, startIndex)
//                        // From comment start till comment end
//                        + selText.substring(startIndex + curMode.commentStart.length, endIndex)
//                        // From comment end till string end
//                        + selText.substr(endIndex + curMode.commentEnd.length);
//                }
//                cm.replaceRange(selText, from, to);
//            }
//        });
//    });
//
//    // Applies automatic mode-aware indentation to the specified range
//    CodeMirror.defineExtension("autoIndentRange", function (from, to) {
//        var cmInstance = this;
//        this.operation(function () {
//            for (var i = from.line; i <= to.line; i++) {
//                cmInstance.indentLine(i, "smart");
//            }
//        });
//    });
//
//    // Applies automatic formatting to the specified range
//    CodeMirror.defineExtension("autoFormatRange", function (from, to) {
//        var cm = this;
//        var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
//        var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
//        var tabSize = cm.getOption("tabSize");
//
//        var out = "", lines = 0, atSol = from.ch == 0;
//
//        function newline() {
//            out += "\n";
//            atSol = true;
//            ++lines;
//        }
//
//        for (var i = 0; i < text.length; ++i) {
//            var stream = new CodeMirror.StringStream(text[i], tabSize);
//            while (!stream.eol()) {
//                var inner = CodeMirror.innerMode(outer, state);
//                var style = outer.token(stream, state), cur = stream.current();
//                stream.start = stream.pos;
//                if (!atSol || /\S/.test(cur)) {
//                    out += cur;
//                    atSol = false;
//                }
//                if (!atSol && inner.mode.newlineAfterToken &&
//                    inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i + 1] || "", inner.state))
//                    newline();
//            }
//            if (!stream.pos && outer.blankLine) outer.blankLine(state);
//            if (!atSol) newline();
//        }
//
//        cm.operation(function () {
//            cm.replaceRange(out, from, to);
//            for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
//                cm.indentLine(cur, "smart");
//            cm.setSelection(from, cm.getCursor(false));
//        });
//    });
//})();
