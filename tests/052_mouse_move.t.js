StartTest(function(t) {
    
    t.testExtJS(function (t) {
        t.it('moving mouse to coordinate / element should work', function (t) {

            var parent = Ext.getBody().createChild({
                id : 'parent',
                tag : 'div',
                style: 'width:50px;height:50px;background:#ccc;'
            });

            t.chain(
                { moveMouseTo : [ 100, 0 ] },

                function (next) {
                    t.isDeeply(t.currentPosition, [ 100, 0 ], 'moveMouseTo Input: Array - Cursor moved to correct place');

                    next();
                },

                { moveMouseTo : parent },

                function (next) {
                    var assert = function(event) {
                        t.is(event.buttons, 1, 'buttons property set correctly');

                        document.body.removeEventListener('mousemove', assert);
                    };

                    t.isDeeply(t.currentPosition, [25, 25], 'moveMouseTo Input: Element - Cursor moved to correct place');

                    // Assure that mouse move operations include the 'buttons' property
                    t.mouseDown(t.currentPosition);

                    // IE and Safari does not support "event.buttons" property
                    if (!Ext.isIE && !Ext.isSafari) document.body.addEventListener('mousemove', assert);
                    
                    next();
                },

                { moveMouseTo : [10, 10] }
            );
        });
    });
});
