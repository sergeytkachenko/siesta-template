StartTest(function(t) {
    
    //==================================================================================================================================================================================
    t.diag("Siesta.Test keyboard simulation");
    
    t.testExtJS(function (t) {
        t.it('Should fire specialkey event on TAB key', function(t) {
            var keys = "[TAB]",
                box = new Ext.form.TextField({
                    enableKeyEvents : true,
                    renderTo : Ext.getBody()
                });

            t.willFireNTimes(box, 'specialkey', 1);
            box.on('specialkey', function(field, e) {
                t.is(e.getKey(), e.TAB, 'TAB simulated ok');
            });
            box.focus();
            t.type(box, "[TAB]", function() {
                box.destroy();
            });
        })

        t.it('should mimic delete last char on BACKSPACE', function (t) {
            document.body.innerHTML = '<input id="foo" type="text" value="abcdef" />';
            var field = document.getElementById('foo');

            t.chain(
                { click : '#foo' },
                { type : '[BACKSPACE][BACKSPACE]' },

                function () {

                    t.is(field.value, 'abcd');

                    t.is(t.getCaretPosition(field), 4);
                }
            );
        });

        t.it('should not mimic char removal if caret is 0 on BACKSPACE press', function (t) {
            document.body.innerHTML = '<input id="foo" type="text" value="abcdef" />';
            var field = document.getElementById('foo');

            t.chain(
                { click : '#foo' },
                function(next) {
                    this.setCaretPosition(field, 0);

                    next();
                },

                { type : '[BACKSPACE]' },

                function () {
                    t.is(field.value, 'abcdef');

                    t.is(t.getCaretPosition(field), 0);
                }
            );
        });

        t.it('should mimic delete char in front of caret on DELETE', function (t) {
            document.body.innerHTML = '<input id="foo" type="text" value="abcdef" />';
            var field = document.getElementById('foo');

            t.chain(
                { click : '#foo' },
                function(next) {
                    this.setCaretPosition(field, 0);

                    next();
                },

                { type : '[DELETE][DELETE]' },

                function () {
                    t.is(field.value, 'cdef');

                    t.is(t.getCaretPosition(field), 0);
                }
            );
        });

        t.it('should NOT mimic delete char in front of caret on DELETE if caret is at the end', function (t) {
            document.body.innerHTML = '<input id="foo" type="text" value="abcdef" />';
            var field = document.getElementById('foo');

            t.chain(
                { click : '#foo' },
                function(next) {
                    this.setCaretPosition(field, 6);

                    next();
                },

                { type : '[DELETE]' },

                function () {
                    t.is(field.value, 'abcdef');

                    t.is(t.getCaretPosition(field), 6);
                }
            );
        });
    });
});
