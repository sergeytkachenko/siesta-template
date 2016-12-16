StartTest(function (t) {

    t.it('Should be able to record mouse move path with queries', function (t) {
        document.body.innerHTML = 
            '<div id="foo" style="width:80px;height:80px;position:absolute;top:100px;left:100px;box-sizing: border-box;border: 1px solid blue">bar</div>' +
            '<div id="baz" style="width:40px;height:40px;position:absolute;top:120px;left:120px;box-sizing: border-box;border: 1px solid red">bar</div>'
        
        var rec = new Siesta.Recorder.ExtJS({
            window          : t.global,
            
            ignoreSynthetic : false,
            
            recordMouseMovePath : 'query'
        })

        t.chain(
            // move the mouse to known coordinate before starting the recording
            // will also fire the initial `mouseover` event
            { moveMouseTo : [ 1, 1 ] },

            function (next) {
                rec.start()
                
                next()
            },
            
            { moveMouseTo : '#foo', offset : [ 0, 0 ] },
            
            // will not be recorded, as does not fire `mouseover/out`
            { moveMouseTo : '#foo', offset : [ '100%', 0 ] },
            
            { moveMouseTo : '#baz' },
            
            { moveMouseTo : [ 5, 140 ] },
            
            function () {
                var actions = rec.getRecordedActions();

                t.is(actions.length, 1);
                t.is(actions[ 0 ].action, 'moveCursorAlongPath');
                
                t.isDeeply(
                    actions[ 0 ].value,
                    [
                        [ '#foo', 0, 0 ],
                        [ '#baz', 39, 1 ],
                        
                        [ '#foo', 19, 40 ],
                        [ -20, 0 ]
                    ]
                );

                rec.stop();
            }
        )
    })
    
    
    t.it('Should be able to record mouse move path with coordinates', function (t) {
        document.body.innerHTML = 
            '<div id="foo" style="width:80px;height:80px;position:absolute;top:100px;left:100px;box-sizing: border-box;border: 1px solid blue">bar</div>' +
            '<div id="baz" style="width:40px;height:40px;position:absolute;top:120px;left:120px;box-sizing: border-box;border: 1px solid red">bar</div>'
        
        var rec = new Siesta.Recorder.ExtJS({
            window          : t.global,
            
            ignoreSynthetic : false,
            
            recordMouseMovePath : 'coordinate'
        })

        t.chain(
            // move the mouse to known coordinate before starting the recording
            // will also fire the initial `mouseover` event
            { moveMouseTo : [ 1, 1 ] },

            function (next) {
                rec.start()
                
                next()
            },
            
            { moveMouseTo : '#foo', offset : [ 0, 0 ] },
            
            // will not be recorded, as does not fire `mouseover/out`
            { moveMouseTo : '#foo', offset : [ '100%', 0 ] },
            
            { moveMouseTo : '#baz' },
            
            // this mouse move will be recorded only partially, on the border of the 'foo' el
            { moveMouseTo : [ 5, 140 ] },
            
            function (next) {
                actions = rec.getRecordedActions();

                t.is(actions.length, 1);
                t.is(actions[ 0 ].action, 'moveCursorAlongPath');
                
                t.isDeeply(
                    actions[ 0 ].value,
                    [
                        [ [ 100, 100 ] ],
                        [ 59, 21 ],
                        [ -40, 19 ],
                        [ -20, 0 ]
                    ]
                );

                rec.stop();
                
                next()
            }
        )
    })
    
    
    t.it('Should always record mouse move path with coordinates when dragging', function (t) {
        document.body.innerHTML = 
            '<div id="foo" style="width:80px;height:80px;position:absolute;top:100px;left:100px;box-sizing: border-box;border: 1px solid blue">bar</div>' +
            '<div id="baz" style="width:40px;height:40px;position:absolute;top:120px;left:120px;box-sizing: border-box;border: 1px solid red">bar</div>'
        
        var rec = new Siesta.Recorder.ExtJS({
            window          : t.global,
            
            ignoreSynthetic : false,
            
            recordMouseMovePath : 'query'
        })

        t.chain(
            // move the mouse to known coordinate before starting the recording
            // will also fire the initial `mouseover` event
            { moveMouseTo : [ 1, 1 ] },
            
            function (next) {
                rec.start()
                
                next()
            },
            
            { mouseDown : [] },
            
            { moveMouseTo : '#foo', offset : [ 0, 0 ] },
            
            // will not be recorded, as does not fire `mouseover/out`
            { moveMouseTo : '#foo', offset : [ '100%', 0 ] },
            
            { moveMouseTo : '#baz' },
            
            { moveMouseTo : [ 5, 140 ] },
            
            { mouseUp : [] },
            
            function (next) {
                actions = rec.getRecordedActions();

                t.is(actions.length, 3);
                t.is(actions[ 0 ].action, 'mousedown');
                t.is(actions[ 1 ].action, 'moveCursorAlongPath');
                t.is(actions[ 2 ].action, 'mouseup');
                
                t.isDeeply(
                    actions[ 1 ].value,
                    [
                        [ [ 100, 100 ] ],
                        [ 59, 21 ],
                        [ -40, 19 ],
                        [ -20, 0 ]
                    ]
                );
                
                t.isDeeply(actions[ 2 ].target.getTargetByType('xy').target, [ 5, 140 ]);

                rec.stop();
                
                next()
            }
        )
    })
    
})
