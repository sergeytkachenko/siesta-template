StartTest(function(t) {
    
    t.testSenchaTouch(function (t) {
        var nameFld     = new Ext.field.Text({
            label       : 'Name',
            labelWidth  : '50%'
        });
    
        var searchFld   = new Ext.field.Search({
            label       : 'search',
            labelWidth  : '50%'
        });
        
        var checkbox    = new Ext.field.Checkbox({
            label       : 'check',
            labelWidth  : '50%'
        });
        
        var panel       = new Ext.Panel({
            width       : 300,
            height      : 300,
            
            items       : [ 
                nameFld, 
                searchFld,
                checkbox
            ]
        })

        t.chain(
            { tap : nameFld },
            { type : 'foo', target : nameFld },
            { tap : searchFld },
            { type : 'foo', target  : searchFld },
            
            { tap : checkbox },
    
            function(next) {
                t.is(nameFld.getValue(), 'foo', 'textfield: Found typed text');
                t.is(searchFld.getValue(), 'foo', 'searchfield: Found typed text');
                t.is(checkbox.getChecked(), true, 'Checkbox has been checked');
            }
        );

        Ext.Viewport.add(panel);
    })
});