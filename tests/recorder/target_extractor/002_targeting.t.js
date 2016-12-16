StartTest(function (t) {

    t.it('Should produce expected targets for clicks', function (t) {
        var panel = new Ext.Panel({
            itemId      : 'pan',
            renderTo    : document.body,
            height      : 200,
            width       : 200,
            title       : 'foo',
            buttons     : [
                {
                    itemId  : 'btn',
                    width   : 100,
                    height  : 50,
                    text    : 'hit me'
                }
            ]
        }).show();

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : '#pan => .x-panel-body'},
            { rightclick : '>>#btn' },

            function () {
                recorder.stop();

                var recordedActions  = recorder.getRecordedActions()

                t.is(recordedActions.length, 2);

                t.is(recordedActions[ 0 ].action, 'click');
                t.isDeeply(
                    recordedActions[ 0 ].getTarget(),
                    {
                        type        : 'csq',
                        target      : '#pan => .x-autocontainer-innerCt'
                    },
                    'Correct target extracted'
                );

                t.is(recordedActions[ 1 ].action, 'contextmenu');
                t.isDeeply(
                    recordedActions[ 1 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : '#pan #btn => .x-btn-inner-default-small',
                        // TODO `rightclick` should also stip the offset as the regular `click` does
                        offset      : t.any()
                    },
                    'Correct target extracted'
                );
            }
        );
    });

    t.it('Should produce expected targets for window header click', function (t) {
        var win = new Ext.Window({
            itemId      : 'win',
            x           : 200,
            y           : 0,
            height      : 100,
            width       : 300,
            title       : 'foo'
        }).show();

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : '>>window header' },

            function () {
                recorder.stop();
                
                var recordedActions  = recorder.getRecordedActions()

                t.is(recordedActions.length, 1);
                
                t.is(recordedActions[ 0 ].action, 'click');
                t.isDeeply(
                    recordedActions[ 0 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : '#win title[text=foo] => .x-title-text'
                    },
                    'Correct target extracted'
                );
            }
        );
    })
})