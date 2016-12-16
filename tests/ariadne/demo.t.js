StartTest(function(t) {
    var domFinder       = new Ariadne.DomQueryFinder()
    var extJSFinder     = new Ariadne.ExtJSDomQueryFinder()
    var extJSCQFinder   = new Ariadne.ExtJSComponentQueryFinder()
    
    var targetExtractor = new Siesta.Recorder.TargetExtractor.ExtJS({})
    
    UNIQUE      = function (selector) { return Sizzle(selector)[ 0 ] }
    
    extJSCQFinder.setExt(Ext)
    
    document.body.addEventListener('click', function (event) {
//        if (!event.ctrlKey) event.preventDefault()
        
        console.log("click target: ", event.target)
        
        var cmp     = extJSCQFinder.getComponentOfDomElement(event.target)
        
        if (cmp) console.log("Ariadne CQ:", extJSCQFinder.findQueries(cmp))
        
        console.log("Ariadne DOM:", extJSFinder.findQueries(event.target))
        
        targetExtractor.setExt(event.target)
        console.log("Target extractor:", targetExtractor.findDomQueryFor(event.target))
        
//        var OptimalSelect   = window.OptimalSelect
//        
//        console.log("OptimalSelect:", OptimalSelect.select(event.target))
//        
//        console.log("QUERYCOUNTER:", QUERYCOUNTER, " EDGES FOUND:", MAZE.countEdges())
    })
})    