StartTest({
    viewportWidth       : 800,
    viewportHeight      : 600
}, function (t) {

    t.it('Should fire `mouseover` action after the `scrollTo`', function (t) {
        document.body.innerHTML =
            '<div id="scrollDiv" style="height: 500px; width: 500px; overflow: scroll">' +
                'Some text<br><br><br><br><br>' +
                '<div id="tallDiv" style="height:1000px;background:red">tall div</div>' +
            '</div>'

        t.chain(
            { moveCursorTo : '#scrollDiv', offset : [ '50%', 25 ] },
            { scrollTo : [ '#scrollDiv', 0, 150 ] },
            
            function (next) {
                t.firesOnce('#tallDiv', 'mouseover')
                
                next()
            },
            
            // `mouseover` should be triggered by this move  
            { moveCursorBy : [ 1, 1 ] }
        )
    });
});