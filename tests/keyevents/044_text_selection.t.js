StartTest(function (t) {
    t.it('should replace selected text with typed text', function (t) {
        document.body.innerHTML = '<input id="foo" type="text" value="Default" />';
        var field               = document.getElementById('foo');

        t.chain(
            function (next) {
                t.selectText(field);
                t.type(field, 'Replacement', next);
            },
            function () {
                t.is(field.value, 'Replacement', 'Selecting text and typing replaces original value.');
            }
        );
    })

    t.it('should delete partially selected text on BACKSPACE', function (t) {
        document.body.innerHTML = '<input id="foo" type="text" value="123456123" />';

        var field = document.getElementById('foo');

        t.selectText(field, 6);

        t.chain(
            { type : '[BACKSPACE]', target : '#foo' },

            function () {

                t.is(field.value, '123456');
                t.is(t.getCaretPosition(field), 6);
            }
        );
    });

    t.it('should delete partially selected text on DELETE', function (t) {
        document.body.innerHTML = '<input id="foo" type="text" value="123456123" />';

        var field = document.getElementById('foo');

        t.selectText(field, 3, 6);

        t.chain(
            { type : '[DELETE]', target : '#foo' },

            function () {
                t.is(field.value, '123123');
                t.is(t.getCaretPosition(field), 3);
            }
        );
    });
});