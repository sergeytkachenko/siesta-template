StartTest(function (t) {

    Ext.define('Ext.Company', {
        extend : 'Ext.data.Model',
        fields : [
            {name : 'company'},
            {name : 'price', type : 'float'}
        ]
    });
    
    var store, grid1
    
    var setupStore  = function () {
        return store = Ext.create('Ext.data.ArrayStore', {
            model : 'Ext.Company',
            data  : [
                ['A', 71.72, 0.02, 0.03, '9/1 12:00am', 'Manufacturing'],
                ['B', 29.01, 0.42, 1.47, '9/1 12:00am', 'Manufacturing'],
                ['C', 83.81, 0.28, 0.34, '9/1 12:00am', 'Manufacturing']
            ]
        });
    }
    
    
    var setup = function (config) {
        grid1 && grid1.destroy()
        
        grid1 = new Ext.grid.Panel(Ext.apply({
            id         : 'grid',
            store      : setupStore(),
            columns    : [
                { text : "Company", width : 200, dataIndex : 'company', tdCls : 'firstCol', editor : { xtype : 'combobox', store : { model : Ext.Company } } },
                { text : "Price", dataIndex : 'price', width : 100 }
            ],
            viewConfig : {
                getRowClass : function (rec) {
                    return rec.get('company') === 'C' ? 'FOO' : '';
                }
            },
            width      : 300,
            height     : 220,
            iconCls    : 'icon-grid',
            renderTo   : Ext.getBody()
        }, config));
    }


    t.it('Grid column header', function (t) {
        setup()

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { moveCursorTo : '#grid gridcolumn[dataIndex=company] => .x-column-header-text' },

            { click : '#grid gridcolumn[dataIndex=company] => .x-column-header-text' },
            { click : '#grid gridcolumn[dataIndex=company] => .x-column-header-trigger' },
            { click : '>> #descItem', offset : [5, 5] },

            function () {
                var recordedActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recordedActions.length, 6);
                t.is(recordedActions[ 0 ].action, 'moveCursorTo');
                t.like(recordedActions[ 0 ].getTarget().target, /#grid gridcolumn\[text=Company\]/);

                t.is(recordedActions[ 1 ].action, 'click');
                // in Ext5 when column header is focused a "::before" element is added, so the following "click" event happens
                // on ".x-column-header-inner" element
                t.like(recordedActions[ 1 ].getTarget().target, /#grid gridcolumn\[text=Company\] => \.x-column-header-(text|inner)/);

                t.is(recordedActions[ 2 ].action, 'click');
                t.is(recordedActions[ 2 ].getTarget().target, '#grid gridcolumn[text=Company] => .x-column-header-trigger');

                t.is(recordedActions[ 3 ].action, 'moveCursorTo');
                t.like(recordedActions[ 3 ].getTarget().target, '#ascItem');

                t.is(recordedActions[ 4 ].action, 'moveCursorTo');
                t.like(recordedActions[ 4 ].getTarget().target, '#descItem');

                t.is(recordedActions[ 5 ].action, 'click');
                t.is(recordedActions[ 5 ].getTarget().target, '#descItem => .x-menu-item-icon');
            }
        )
    })
    
    
    t.it('Should record `moveCursorTo` again, if cursor returns to the same "point of interest" element after mouse out', function (t) {
        setup()

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);

        t.chain(
            { moveCursorTo : '>>#grid gridcolumn[dataIndex=price]', offset : [ '120%', '50%' ] },
            function (next) {
                recorder.start()
                
                next()
            },
            // in this scenario we move mouse to column, then outside and then back again
            // note, that we target different points, so that cursor will cross border of the column
            // in different points. Otherwise it will cross the border in the same point
            // and 2nd `moveCursorTo` action will not be created (as it will be identical to previous)
            { moveCursorTo : '>>#grid gridcolumn[dataIndex=price]', offset : [ '50%', '10%' ] },
            { moveCursorTo : '>>#grid gridcolumn[dataIndex=price]', offset : [ '120%', '50%' ] },
            { moveCursorTo : '>>#grid gridcolumn[dataIndex=price]', offset : [ '50%', '90%' ] },

            function () {
                recorder.stop();
                
                var recordedActions = recorder.getRecordedActions();

                t.is(recordedActions.length, 2);
                
                t.is(recordedActions[ 0 ].action, 'moveCursorTo');
                t.like(recordedActions[ 0 ].getTarget().target, /#grid gridcolumn\[text=Price\]/);
                
                t.is(recordedActions[ 1 ].action, 'moveCursorTo');
                t.like(recordedActions[ 1 ].getTarget().target, /#grid gridcolumn\[text=Price\]/);
            }
        )
    })
    

    
    t.it('Grid rows', function (t) {
        setup()

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);
        
        var rowContainerSelector    = Ext.grid.View.prototype.itemSelector

        t.chain(
            { moveCursorTo : '#grid => ' + rowContainerSelector + ':nth-child(2) .x-grid-cell:nth-child(2)' },
            
            function (next) {
                // starting recording only after the cursor has been moved, to avoid "moveCursorTo" records
                recorder.start()
                next()
            },
        
            { click : '#grid => ' + rowContainerSelector + ':nth-child(2) .x-grid-cell:nth-child(2)' },
            { click : '#grid => .FOO .firstCol' },
            { doubleclick : '#grid => .FOO .firstCol' },

            function () {
                var recordedActions     = recorder.getRecordedActions();

                recorder.stop();

                t.is(recordedActions.length, 3);
                t.is(recordedActions[ 0 ].action, 'click');
                t.is(recordedActions[ 0 ].getTarget().target, '#grid tableview => .x-grid-cell-inner:textEquals(29\\.01)');

                t.is(recordedActions[ 1 ].action, 'click');
                t.is(recordedActions[ 1 ].getTarget().target, '#grid tableview => .FOO .firstCol .x-grid-cell-inner');
                
                t.is(recordedActions[ 2 ].action, 'dblclick');
                t.is(recordedActions[ 2 ].getTarget().target, '#grid tableview => .FOO .firstCol .x-grid-cell-inner');
            }
        )
    })


    t.it('Double click', function (t) {
        // this test used to have cell editing plugin with "clicksToEdit : 1" config
        // which lead to mess in IE, because in IE cell editing starts asynchronously
        // so basically the editor was popping up in the middle of doubleclick chain 
        // breaking the targets
        // the intent of having cellediting was not clear, so it was removed
        setup();

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);

        t.chain(
            { waitForRowsVisible : grid1 },

            { moveCursorTo : '#grid => .FOO .firstCol' },
            
            function (next) {
                // starting recording only after the cursor has been moved, to avoid "moveCursorTo" records
                recorder.start()
                next()
            },
            
            { dblclick : '#grid => .FOO .firstCol' },

            function () {
                recorder.stop();
                
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 1);
                t.is(recordedActions[ 0 ].action, 'dblclick');
                t.is(recordedActions[ 0 ].getTarget().target, '#grid tableview => .FOO .firstCol .x-grid-cell-inner');
            }
        )
    })

    // seems to be outdated, because does not take recorded "moveCursorTo" actions into account
    // Disabled until we properly mimic 'buttons' property on mousemove events
    // https://app.assembla.com/spaces/bryntum/tickets/3160---39-buttons--39--event-property-not-set-during-mousemove-drag-operation/details#
    t.xit('Grid column drag', function (t) {
        setup({
            id      : 'grid3',
            columns    : [
                { text : "Company", dataIndex : 'company', width : 100 },
                { text : "Price", dataIndex : 'price', width : 100 }
            ]
        });

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : '>>#grid3 [dataIndex=company]', by : [100, 0] },

            function () {
                recorder.stop();
                
                var recordedActions     = recorder.getRecordedActions();

                // t.is(recordedActions.length, 1);
                // t.is(recordedActions[ 0 ].action, 'drag');
                // t.is(recordedActions[ 0 ].getTarget().target, '#grid3 gridcolumn[text=Company] => .x-column-header-text');
            }
        )
    })

    
    t.it('Grid column resize', function (t) {
        setup({
            id          : 'grid4',
            columns     : [
                { text : "Price", width : 50, dataIndex : 'price' }
            ]
        });

        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : '>>#grid4 [dataIndex=price]', by : [ 50, 0 ], offset : [ '100%-2', 5 ] },

            function (next) {
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 3);

                t.is(recordedActions[ 0 ].action, 'moveCursorTo');
                
                if (Ext.getVersion('ext').major == 5)
                    t.is(recordedActions[ 0 ].getTarget().target, '#grid4 gridcolumn[text=Price]');
                else
                    t.is(recordedActions[ 0 ].getTarget().target, '#grid4 gridcolumn[text=Price] => .x-leaf-column-header');

                t.is(recordedActions[ 1 ].action, 'mousedown');
                t.is(recordedActions[ 1 ].getTarget().target, '#grid4 gridcolumn[text=Price] => .x-column-header-trigger');

                t.is(recordedActions[ 2 ].action, 'mouseup');
                t.isApprox(recordedActions[ 2 ].getTarget().target[0], 100, 10);
            }
        )
    })
    
    
    t.it('Drag on grid cells - troubles in IE because of `mousedown/up` events', function (t) {
        setup({
            id          : 'grid5'
        });
        
        var recorder            = new Siesta.Recorder.ExtJS({ ignoreSynthetic : false });

        t.chain(
            // move cursor first, to avoid recordings of `moveCursorTo` actions over the column headers
            { moveCursorTo : '#grid5 tableview => .x-grid-item:nth-of-type(2) .firstCol .x-grid-cell-inner' },
            
            function (next) {
                recorder.attach(window);
                recorder.start();
                
                next()
            },
            
            { drag : '#grid5 tableview => .x-grid-item:nth-of-type(2) .firstCol .x-grid-cell-inner', by : [ 150, 0 ] },

            function (next) {
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 2);

                t.is(recordedActions[ 0 ].action, 'mousedown');
                t.is(recordedActions[ 0 ].getTarget().target, '#grid5 tableview => .x-grid-item:nth-of-type(2) .firstCol .x-grid-cell-inner');

                t.is(recordedActions[ 1 ].action, 'mouseup');
                t.isApprox(recordedActions[ 1 ].getTarget().target[0], 250, 10);
            }
        )
    })    
})