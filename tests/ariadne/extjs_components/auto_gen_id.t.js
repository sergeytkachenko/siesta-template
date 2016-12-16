StartTest(function (t) {
    
    var panel
    var finder      = new Ariadne.ExtJSComponentQueryFinder()
    
    finder.setExt(Ext)

    t.beforeEach(function() {
        panel && panel.destroy();
    })

    t.it('Should not record auto-generated ids of the tree list items', function (t) {
        var store           = new Ext.data.TreeStore({
            fields      : [ 'id', 'text' ],
            
            root        : {
                expanded        : true,
                children        : [
                    { id : '1', text : '1', leaf : true },
                    { id : '2', text : '2', leaf : true }
                ]
            }
        })
        
        panel               = new Ext.list.Tree({
            renderTo    : document.body,
            
            width       : 500,
            height      : 300,
            
            store       : store
        })
        
        var treeListItem    = t.cq1('treelistitem')
        
        t.is(finder.componentHasAutoGeneratedId(treeListItem), true, "Widget with auto-generated id has been detected correctly")
    })
    
    
    t.it('Should not record auto-generated ids of the tree list items', function (t) {
        panel               = new Ext.panel.Panel({
            renderTo    : document.body,
            
            width       : 500,
            height      : 300,
            
            id          : Ext.id()
        })
        
        t.is(finder.componentHasAutoGeneratedId(panel, Ext), true, "Component with auto-generated id has been detected correctly")
    })    
})