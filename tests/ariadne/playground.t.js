StartTest(function(t) {
    DOMFINDER   = new Ariadne.DomQueryFinder()
    EXTJSFINDER = new Ariadne.ExtJSDomQueryFinder()
    EXTJSCQFINDER = new Ariadne.ExtJSComponentQueryFinder()
    BODY        = document.body
    
    EXTJSCQFINDER.setExt(Ext)
    
    UNIQUE      = function (selector) { return Sizzle(selector)[ 0 ] }
    
//    console.profile('findquery')

//    console.log(EXTJSFINDER.findQueries(UNIQUE('#button-1055-btnInnerEl')))
//    console.log(EXTJSFINDER.findQueries(UNIQUE('#treepanel-1052_header-title-textEl')))
    console.log(EXTJSFINDER.findQueries(UNIQUE('#content-panel .x-container:nth-of-type(3) .x-btn-inner:textEquals(Option Two)')))
    
    
//    var el      = Sizzle("#content-panel .x-component:textEquals(Icon and Text \(right\))")[ 0 ]
//    var cmp     = EXTJSCQFINDER.getComponentOfDomElement(el)
//    console.log("Ariadne CQ:", EXTJSCQFINDER.findQueries(cmp))
    
    
//    console.profileEnd()
    
    console.log("QUERYCOUNTER:", QUERYCOUNTER, " EDGES FOUND:", MAZE.countEdges())
})    