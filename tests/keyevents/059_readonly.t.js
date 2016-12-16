describe('disabled / readonly INPUTs', function (t) {


    t.it('Should simulate key events even if input is readonly', function (t) {
        document.body.innerHTML = '<input type="text" id="foo" readonly="readonly"/>';

        t.willFireNTimes('#foo', 'keydown', 1)
        t.willFireNTimes('#foo', 'keypress', 1)
        t.willFireNTimes('#foo', 'keyup', 1)

        t.chain(
            { type : 'b', target : '#foo' },

            function () {
                t.expect(document.getElementById('foo').value).toBe('');
            }
        )
    });

    t.it('Should NOT simulate key events if input is disabled', function (t) {
        document.body.innerHTML = '<input type="text" id="baz" disabled="disabled"/>';

        t.wontFire('#baz', 'keydown', 1)
        t.wontFire('#baz', 'keypress', 1)
        t.wontFire('#baz', 'keyup', 1)

        t.chain(
            { type : 'b', target : '#baz' },

            function () {
                t.expect(document.getElementById('baz').value).toBe('');
            }
        )
    });
});