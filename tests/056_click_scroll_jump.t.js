// This test verifies the "scroll jump" - a weird native browser behavior, when it scrolls the 
// page on the dispatch of synthetic event. In such cases, if scroll happened after "mousedown" event
// the "mouseup" and "click" events may be fired on wrong element
//
// in such cases we should take into account the scroll change, and simulate the following events in the same point
//
// its not easy to reproduce this behavior, thats why a react app is used
StartTest({
    pageUrl         : 'reactunes/app.html',
    viewportWidth   : 1285,
    viewportHeight  : 370,
    preload         : []
}, function (t) {
    t.chain(
        { click : "#app .field:nth-of-type(1) input.search" },

        { click : "#app .transition .item:nth-of-type(1)" },

        { click : "#app .field:nth-of-type(2) input.search" },

        { click : "#app .visible .item:nth-of-type(1)", offset : [87.359375, 27.625] },
        
        function () {
            t.selectorExists('#app .text :textEquals(United States of America)')
        }
    );
});

