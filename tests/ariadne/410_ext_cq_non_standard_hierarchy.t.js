StartTest(function(t) {
    
    var finder      = new Ariadne.ExtJSComponentQueryFinder()
    
    finder.setExt(Ext)
    
    t.it('Should find basic xtype query', function (t) {
        var store   = new Ext.data.Store({
            fields  : [ 'id', 'name' ],
            data    : [
                { "id" : "id1", "name" : "name1" },
                { "id" : "id2", "name" : "name2" },
                { "id" : "id3", "name" : "name3" }
            ]
        });        
        
        var panel       = new Ext.panel.Panel({
            width       : 300,
            height      : 200,
            
            renderTo    : document.body,
            
            items       : [
                {
                    xtype           : 'combo',
                    store           : store,
                    displayField    : 'name',
                    valueField      : 'id',
                    queryMode       : 'local',
                    
                    isCombo1        : true
                },
                {
                    xtype           : 'combo',
                    store           : store,
                    displayField    : 'name',
                    valueField      : 'id',
                    queryMode       : 'local',
                    
                    isCombo2        : true
                }
            ]
        })
        
        var picker1     = Ext.ComponentQuery.query('[isCombo1]')[ 0 ].getPicker()
        
        var queries     = finder.findQueries(picker1)
        
        // at this point, there's only one `boundlist` on the page, so just "boundlist" should be enough
        // to uniquely identify it, but, if user has clicked the another combobox, there would be 2 boundlists..
        // we don't want to rely on the order the fields are clicked, so we want to always identify the 
        // combobox first, and then - the boundlist within it
        t.isDeeply(queries, [ 'combobox:nth-child(1) boundlist' ], "Should identify combobox, even that `boundlist` is specific enough")
        
        panel.destroy()
    })
})