/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.UI.TargetColumn', {
    extend       : 'Ext.grid.Column',
    alias        : 'widget.targetcolumn',
    
    requires        : [
        'Siesta.Recorder.UI.Editor.Array',
        'Siesta.Recorder.UI.Editor.Target',
        'Siesta.Recorder.UI.Editor.DragTarget',
        'Siesta.Recorder.UI.Editor.Code'
    ],

    header       : Siesta.Resource('Siesta.Recorder.UI.TargetColumn', 'headerText'),
    dataIndex    : 'target',
    flex         : 1,
    sortable     : false,
    menuDisabled : true,
    field        : {},
    tdCls        : 'eventview-targetcolumn',

    // API for highlighting typed target text, supplied by owner/creator
    highlightTarget : null,


    renderer : function (value, meta, record) {
        // we are not interested in the default value which is the "target" field value
        value               = ''

        var actionName      = (record.data.action || '').toLowerCase()

        if (record.hasTarget()) {
            var target      = record.getTarget()

            if (target) {
                var R           = Siesta.Resource('Siesta.Recorder.UI.TargetColumn');

                value               = target.target

                if (target && target.type == 'cq') value = '>>' + value

                if (actionName === 'drag') {

                    var toTarget    = record.data.toTarget
                    var by          = record.data.by

                    if (toTarget && toTarget.targets.length && (!toTarget.isTooGeneric() || !by))
                        value       += ' ' + R.get('to') + ': ' + toTarget.getTarget().target;
                    else if (by)
                        value       += ' ' + R.get('by') + ': [' + by + ']';
                }

                meta.tdCls = 'eventview-target-' + target.type

                if (target.type === 'xy') {
                    meta.tdAttr = "title='" + R.get('coordinateTargetWarning') + "'";
                }
            }
        } else if (actionName == 'movecursoralongpath') {
            value           = JSON.stringify(record.$action.value)
        } else {
            var value       = record.get('value');
            var options     = record.data.options;
            
            var getReadableStringWithModifierKeys = function (text, ctrlKey, metaKey, shiftKey) {
                var modifierKeys = '';
                var modifierRe   = /CTRL|CMD|SHIFT/;

                if (ctrlKey) {
                    modifierKeys = '[CTRL]';
                }

                if (metaKey) {
                    modifierKeys += '[CMD]';
                }

                if (shiftKey) {
                    modifierKeys += '[SHIFT]';
                }

                // Prepend modifier keys to all chars typed
                if (modifierKeys) {
                    var keys            = Siesta.Util.Role.CanFormatStrings.meta.getMethod('extractKeysAndSpecialKeys').value(value);
                    var prependedKeys   = keys.map(function(character){

                        // Don't prepend recorded special keys
                        if (!modifierRe.test(character)) {
                            return ('<span class="modifierkeys">' + modifierKeys + '</span>' + character);
                        }

                        return '';
                    })

                    text = prependedKeys.join('');
                }

                return text;
            };

            if (value !== null && value !== undefined && options) {
                // Prepend modifier keys to all chars typed
                var keys = Siesta.Util.Role.CanFormatStrings.meta.getMethod('extractKeysAndSpecialKeys').value(value);

                value    = getReadableStringWithModifierKeys(value, options.ctrlKey, options.metaKey && Ext.isMac, options.shiftKey);
            }
        }

        meta.tdAttr = 'title="' + Ext.String.htmlEncode(value) + '"';

        return value;
    },

    
    setTargetEditor : function (actionRecord) {
        var newField = this.getTargetEditor(actionRecord);

        // Not all actions have target editors
        if (!newField) {
            return false;
        }

        this.setEditor(newField);
    },


    getTargetEditor : function (record) {
        var me          = this;
        var action      = record.get('action');
        var editor;

        if (action.match(/^waitFor/)) {
            if (action === 'waitForAnimations') return null;

            if (action === 'waitForFn') {
                editor =  new Siesta.Recorder.UI.Editor.Code();
            } else {
                this.dataIndex = 'value';

                if (action === 'waitForMs') {
                    editor = new Ext.form.field.Number()
                } else {
                    // Default waitFor editor will just be a text field
                    editor = new Ext.form.field.Text();
                }
            }
        } else if (action === 'drag') {
            this.dataIndex = 'target';

            editor = new Siesta.Recorder.UI.Editor.DragTarget({
                onTargetChange : function () {
                    me.onTargetChange.apply(me, arguments);
                },
                
                listeners : {
                    collapse : function () {
                        me.up('tablepanel').editing.cancelEdit()
                    }
                }
            });
        } else if (action === 'fn') {
            this.dataIndex = 'value';

            editor = new Siesta.Recorder.UI.Editor.Code();
        } else if (action === 'type' || action === 'moveCursorBy' || action === 'screenshot' || action === 'setUrl') {
            this.dataIndex = 'value';

            editor =  new Ext.form.field.Text();
        }else if (action === 'setWindowSize') {
            this.dataIndex = 'value';

            editor =  new Siesta.Recorder.UI.Editor.Array();
        }
        else {
            // Assume it's a target action
            this.dataIndex = 'target';

            editor = new Siesta.Recorder.UI.Editor.Target({
                listeners : {
                    select : this.onTargetChange,
                    keyup  : this.onTargetChange,
                    focus  : this.onTargetChange,
                    buffer : 50,
                    scope  : this
                }
            });
            editor.populate(record.data.target);
        }

        // Give editor access to the record
        editor.record = record;

        return editor;
    },


    onTargetChange : function (field) {
        var target      = field.getTarget();

        if (!target) return;

        var textTarget  = target.target

        if (target.type == 'cq') textTarget = '>>' + textTarget

        if (this.highlightTarget) {
            var result      = this.highlightTarget(textTarget, target.offset);

            if (result.success) {
                field.clearInvalid()
            } else {
                field.markInvalid(result.message);
            }
        }
    }
});
