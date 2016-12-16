StartTest(function(t) {
    
    var finder      = new Ariadne.DomQueryFinder()
    var body        = document.body
    
    var unique      = function (selector) { return body.querySelectorAll(selector)[ 0 ] }

    
    t.it('Should escape special characters', function (t) {
        body.innerHTML = 
            '<a>' +
                '<b id="foo:bar.">' +
                    '<c></c>' +
                '</b>' +
            '</a>'
        
        t.isDeeply(finder.findQueries(unique('c')), [ '#foo\\:bar\\. c' ])
    })

    
    t.it('magic selector', function (t) {
        body.innerHTML = 
            '<a>' +
            '</a>' +
            '<a target=true class="-">' +
            '</a>'
        
        t.isDeeply(finder.findQueries(unique('[target=true]')), [ '.\\-' ])
    })
    
    
    t.it('Long&crazy attribute value', function (t) {
        body.innerHTML = 
            '<a>' +
            '</a>' +
            '<a target=true>' +
            '</a>'
            
        unique('[target=true]').title = "Error: Module [Ariadne.DomQueryFinder] may not be instantiated. Forgot to 'use' the class with the same name?\n    at new <anonymous> (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:2760:71)\n    at Object.initialize (http://www.bryntum.com/errorlogger/errorlogger-full-extjs.js:37:49840)\n    at Object.override [as initialize] (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:809:32)\n    at Object.originalCall (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:720:37)\n    at Object.initialize (http://www.bryntum.com/errorlogger/errorlogger-full-extjs.js:37:72223)\n    at Object.override [as initialize] (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:809:32)\n    at new <anonymous> (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:1930:61)\n    at Object.initialize (http://www.bryntum.com/errorlogger/errorlogger-full-extjs.js:37:52284)\n    at Object.override [as initialize] (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:809:32)\n    at Object.originalCall (http://www.bryntum.com/errorlogger/deps/siesta/siesta-recorder-with-domcontainer-no-ui.js:720:37)"
        
        t.livesOk(function () {
            finder.findQueries(unique('[target=true]'))
        })
    })
})    