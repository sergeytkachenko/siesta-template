StartTest(function (t) {

    t.it('Slider test', function (t) {

        new Ext.Panel({
            renderTo    : document.body,
            xtype       : 'panel',
            title       : 'Slider',
            height      : 200,
            width       : 200,
            layout      : 'anchor',

            items : [
                {
                    xtype     : 'slider',
                    anchor    : '100%'
                },
                {
                    xtype    : 'slider',
                    vertical : true,
                    height   : 100
                }
            ]
        });

        // Menus require a bit of special treatment since a submenu doesn't open sync,
        // We may actually need to automatically inject a 'waitForTarget' statement before clicking a menu item
        var recorder = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : 'panel slider => .x-slider-thumb', by: [40, 0] },
            { drag : 'panel slider => .x-slider-thumb', by: [-30, 0] },

            function () {
                var steps = recorder.getRecordedActionsAsSteps();

                recorder.stop();

                t.is(steps.length, 4);
                
                t.is(steps[ 0 ].action, "mousedown")
                t.is(steps[ 0 ].target, "slider:nth-child(1) => .x-slider-thumb")
                t.is(steps[ 1 ].action, "mouseup")

                t.isApprox(steps[ 1 ].target[0], 50);

                t.is(steps[ 2 ].action, "mousedown")
                t.is(steps[ 2 ].target, "slider:nth-child(1) => .x-slider-thumb")
                t.is(steps[ 3 ].action, "mouseup")
                t.isApprox(steps[ 3 ].target[0], 20, 5);
            }
        );
    })
})