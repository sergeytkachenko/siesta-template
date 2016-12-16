StartTest(function(t) {
    t.autoCheckGlobals  = false
    
    var finder  = new Ariadne.ExtJSDomQueryFinder()
    
    UNIQUE      = function (selector) { return Sizzle(selector)[ 0 ] }
    
    t.it('Button one', function (t) {
        var queries = finder.findQueries(UNIQUE('#content-panel .x-container:nth-of-type(3) .x-btn-inner:textEquals(Option Two)'))
        
        t.isGE(queries.length, 3, 'Should find at least 3 queries')
    })
})    