StartTest(function(t) {
    
    //==================================================================================================================================================================================
    t.diag("Siesta mouse click simulation");
    
    t.testExtJS(function (t) {
        t.it('Verify check box click works', function (t) {
            document.body.innerHTML = '<input type="checkbox" />';
            t.click('input');
            t.selectorExists('input:checked', 'Checkbox should be checked after clicking it');
        })


        t.it('plain simple clicks', function (t) {
            var clickDiv = Ext.getBody().createChild({
                tag     : 'div',
                style   : 'width : 40px;',
                html    : 'testing click'
            });
            t.willFireNTimes(clickDiv, 'mousedown', 1,  'left click is ok #1');
            t.willFireNTimes(clickDiv, 'mouseup', 1,  'left click is ok #2');
            t.willFireNTimes(clickDiv, 'click', 1,  'left click is ok #3');

            clickDiv.on('click', function(event) {
                t.is(event.button, 0, 'button to 0 for left click');
                
                // IE and Safari does not support "event.buttons" property
                if (!Ext.isIE && !Ext.isSafari) t.is(event.buttons, 1, 'buttons to 1 for left click');
            });

            t.chain(
                {
                    click      : clickDiv
                }
            )
        });

        
        t.it('mousedown + mouseup abstraction should fire same event as regular click', function (t) {
            var mouseDownUpDiv = Ext.getBody().createChild({
                tag     : 'div',
                style   : 'width : 40px;background:red;',
                html    : 'testing click'
            });
            
            t.willFireNTimes(mouseDownUpDiv, 'mousedown', 1);
            t.willFireNTimes(mouseDownUpDiv, 'mouseup', 1);
            t.willFireNTimes(mouseDownUpDiv, 'click', 1);

            mouseDownUpDiv.on('click', function(event) {
                t.is(event.button, 0, 'button to 0 for left click');
                
                // IE and Safari does not support "event.buttons" property
                if (!Ext.isIE && !Ext.isSafari) t.is(event.buttons, 1, 'buttons to 1 for left click');
            });

            t.chain(
                { mousedown      : mouseDownUpDiv },
                { moveCursorBy  : [2,2] },
                { mouseup      : mouseDownUpDiv }
            )
        });

        
        t.it('mousedown + mouseup abstraction should NOT fire click event if mouseup is not in same parent el as the mousedown source', function (t) {
            var mouseDownUpDiv = Ext.getBody().createChild({
                tag     : 'div',
                style   : 'width : 40px;background:red;',
                html    : 'testing click'
            });
            
            t.willFireNTimes(mouseDownUpDiv, 'mousedown', 1);
            t.willFireNTimes(document.body, 'mouseup', 1);
            t.wontFire(mouseDownUpDiv, 'mouseup');
            t.willFireNTimes(mouseDownUpDiv, 'click', Ext.isIE ? '<=1' : 0);
            

            t.chain(
                { mousedown      : mouseDownUpDiv },

                function(next) {
                    mouseDownUpDiv.dom.style.display = 'none';
                    next();
                },

                { mouseup      : [] }
            )
        });
        

        t.it('right clicks', function (t) {

            var rightClickDiv = Ext.getBody().createChild({
                tag     : 'div',
                style   : 'width : 40px;',
                html    : 'testing right click'
            });

            t.willFireNTimes(rightClickDiv, 'mousedown', 1,  'right click is ok #1');

            // Mac doesn't fire mouseup for right click
            if (!Ext.isMac) {
                t.willFireNTimes(rightClickDiv, 'mouseup', 1,  'right click is ok #2');
            }

            t.willFireNTimes(rightClickDiv, 'contextmenu', 1,  'right click is ok #3');

            rightClickDiv.on('contextmenu', function(event) {
                t.is(event.button, 2, 'button to 2 for contextmenu');
                if (!Ext.isIE && !Ext.isSafari) t.is(event.buttons, 2, 'buttons to 2 for contextmenu');
            });

            t.chain(
                {
                    rightClick      : rightClickDiv
                }
            )
        });


        t.it('double clicks', function (t) {

            var doubleClickDiv = Ext.getBody().createChild({
                tag     : 'div',
                style   : 'width : 40px;',
                html    : 'testing double click'
            });

            t.willFireNTimes(doubleClickDiv, 'mousedown', 2,  'double click is ok #1');
            t.willFireNTimes(doubleClickDiv, 'mouseup', 2,  'double click is ok #2');
            t.willFireNTimes(doubleClickDiv, 'click', 2,  'double click is ok #3');
            t.willFireNTimes(doubleClickDiv, 'dblclick', 1,  'double click is ok #4');

            // now clicking in the center of the outer (bigger) div
            // but the click should happen on the top-most element at that position in the DOM
            var div2 = Ext.getBody().createChild({
                tag     : 'div',
                style   : 'width : 100px; height : 100px; background: blue',

                children    : {
                    tag     : 'div',
                    style   : 'width : 50px; height : 50px; background: yellow; position : relative; top : 25px; left : 25px',
                    html    : '&nbsp'
                }
            });

            var innerDiv    = div2.child('div')

            t.willFireNTimes(innerDiv, 'mousedown', 1,  'top click is ok #1');
            t.willFireNTimes(innerDiv, 'mouseup', 1,  'top click is ok #2');
            t.willFireNTimes(innerDiv, 'click', 1,  'top click is ok #3');

            t.chain(
                {
                    doubleclick      : doubleClickDiv
                },
                {
                    click      : div2
                }
            )
        });
    });
});

