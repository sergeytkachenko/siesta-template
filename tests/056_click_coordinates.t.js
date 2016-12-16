StartTest({
    viewportHeight      : 500,
    viewportWidth       : 800
}, function (t) {
    
    t.beforeEach(function () {
        document.body.innerHTML = 
            '<div style="position:absolute; width: 10px; height:1500px; border-style:solid; border-width:1px;">scroller</div>' +
            '<div id="clicker" style="position:absolute; left: 100px; top: 600px; height:200px; background:red;">clicker</div>'
            
        document.body.scrollTop = 500
    })
    
    
    t.it('`getElementAtCursor`', function (t) {
        t.chain(
            { moveMouseTo : '#clicker' },
            
            function (next) {
                t.is(t.getElementAtCursor(), t.query('#clicker')[ 0 ])
                
                next()
            }
        )
    })
    
    
    t.it('`Move mouse to`', function (t) {
        t.firesOnce('#clicker', 'click')
        
        t.chain(
            { click : [ 110, 700 ] }
        )
    })
    
    
    t.it('`Move mouse to - need to scroll target point into view`', function (t) {
        document.body.scrollTop = 0
        
        t.firesOnce('#clicker', 'click')
        
        t.chain(
            { click : [ 110, 700 ] }
        )
    })    
    
    
    t.it('`Drag from coordinates`', function (t) {
        t.firesOnce('#clicker', 'mousedown')
        
        t.chain(
            { drag : [ 110, 700 ], by : [ 50, 50 ] }
        )
    })    
    
});