var harness = new Siesta.Harness.Browser.ExtJS()

harness.configure({
    title               : 'Siesta Examples',
    viewDOM             : true,
    
    enableCodeCoverage  : harness.isStandardPackage(), // Only in full version of Siesta
    coverageUnit        : 'extjs_class', // can be "file" or "extjs_class"

    // Define any global JS and CSS dependencies, these files will be injected into each test.
    preload             : [],

    // If your tests use dynamic loading, you can setup your paths using the 'loaderPath' config.
    loaderPath          : { 'Ext.ux' : '//cdn.sencha.com/ext/gpl/5.1.0/examples/ux' },
    
    recorderConfig      : {
        // enable/disable certain features of the recorder, see the Siesta.Recorder.Recorder documentation
        recordMouseMoveOnIdle   : true,
        recordPointsOfInterest  : true,
        recordMouseMovePath     : false,
        recordScroll            : false,
        recordInitialWindowSize : false
    }
});

harness.start(
    // Start here, and learn the basic unit testing functionality in Siesta
    {
        group            : 'Unit tests',
        autoCheckGlobals : true,
        sandbox          : false, // speeds it up, sharing the same iframe for tests in this group

        items : [
            '1.unit-tests/basic_assertions.t.js'
        ]
    }
);
// eof Harness.start
