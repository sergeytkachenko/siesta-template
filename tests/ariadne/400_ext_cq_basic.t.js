StartTest(function(t) {
    var panel
    var finder      = new Ariadne.ExtJSComponentQueryFinder()
    
    finder.setExt(Ext)
    
    t.beforeEach(function () {
        panel && panel.destroy()
    })
    
    t.it('Should find basic xtype query', function (t) {
        var store       = new Ext.data.Store({
            fields      : [ "id", "name" ],
            
            data        : [
                { id : 1, name : "Name" },
                { id : 2, name : "Name" },
                { id : 3, name : "Name" },
                { id : 4, name : "Name" }
            ]
        })
        
        var grid        = new Ext.grid.Panel({
            store       : store,
            
            columns: [
                { text: 'Id', dataIndex: 'id', width: 120 },
                { text: 'Name',  dataIndex: 'name', width: 200 }
            ],
            
            width       : 300,
            height      : 200,
            
            renderTo    : document.body
        })
        
        var queries     = finder.findQueries(grid)
        
        t.isDeeply(queries, [ 'gridpanel' ], "Correct queries found")
        
        grid.destroy()
    })

    
    t.it('Should fall back to nth-child', function (t) {
        panel       = new Ext.panel.Panel({
            width       : 300,
            height      : 200,
            
            renderTo    : document.body,
            
            items       : [
                {
                    xtype       : 'panel',
                    isTarget1   : true
                }
            ]
        })
        
        var queries     = finder.findQueries(Ext.ComponentQuery.query('[isTarget1]')[ 0 ])
        
        t.isDeeply(queries, [ 'panel(true):nth-child(1)' ], "Correct queries found")
    })
    

    t.it('Should use property value', function (t) {
        panel       = new Ext.panel.Panel({
            title       : 'Parent panel',
            
            width       : 300,
            height      : 200,
            
            renderTo    : document.body,
            
            items       : [
                {
                    xtype       : 'panel',
                    title       : 'Child panel',
                    isTarget2   : true
                }
            ]
        })
        
        var queries     = finder.findQueries(Ext.ComponentQuery.query('[isTarget2]')[ 0 ])
        
        t.isDeeply(queries, [ 'panel[title=Child panel]' ], "Correct queries found")
    })
    
    
    t.it('Mandatory real id + itemId', function (t) {
        panel       = new Ext.panel.Panel({
            title       : 'Parent panel',
            
            width       : 300,
            height      : 200,
            
            id          : 'outerPanel',
            
            renderTo    : document.body,
            
            items       : [
                {
                    xtype       : 'panel',
                    title       : 'Child panel',
                    isTarget3   : true,
                    
                    itemId      : 'innerPanel'
                }
            ]
        })
        
        var queries     = finder.findQueries(Ext.ComponentQuery.query('[isTarget3]')[ 0 ])
        
        t.isDeeply(queries, [ '#outerPanel #innerPanel' ], "Correct queries found")
    })    
    
    
    t.it('Mandatory real id + property value', function (t) {
        panel       = new Ext.form.Panel({
            id          : 'form-widgets',
            title       : 'Form Widgets',
            width       : 500,
            renderTo    : document.body,
    
            items : [
                {
                    fieldLabel : 'fieldLabel',
                    xtype      : 'textfield',
                    name       : 'someField',
                    emptyText  : 'Enter a value'
                }
            ]
        })
        
        var queries     = finder.findQueries(Ext.ComponentQuery.query('#form-widgets textfield')[ 0 ])
        
        t.isDeeply(
            queries, 
            [ 
                "#form-widgets textfield[name=someField]", "#form-widgets textfield[inputType=text]", 
                "#form-widgets textfield[fieldLabel=fieldLabel]", "#form-widgets textfield" 
            ], 
            "Correct queries found"
        )
    })
    
    
    t.it('Extracting component query should work', function (t) {
        var tbar, bbar

        panel               = new Ext.panel.Panel({
            id       : 'foo',
            renderTo : document.body,
            items    : [
                {
                    xtype       : 'container',
                    itemId      : 'bar'
                }
            ],
            
            tbar    : tbar = new Ext.toolbar.Toolbar({
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            }),
            
            bbar    : bbar = new Ext.toolbar.Toolbar({
                itemId  : 'bottom',
                
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            })
        })
        
        t.isDeeply(
            finder.findQueries(panel.items.getAt(0)), 
            [ '#foo #bar' ], 
            'The #id selector is always included, even when redundant'
        )
        
        t.isDeeply(
            finder.findQueries(tbar.items.getAt(0)), 
            [ "#foo button[text=Ok]:nth-child(1)", "#foo button:nth-child(1)" ], 
            'The #id selector is always included, even when redundant'
        )
        
        t.isDeeply(
            finder.findQueries(bbar.items.getAt(0)), 
            [ '#foo #bottom button[text=Ok]' ], 
            'The #id selector is always included, even when redundant'
        )
    });
})