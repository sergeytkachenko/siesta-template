StartTest(function(t) {
    
    // no "mouseenter/leave" events except the IE, and frameworks tends to emulate them
    // so we use a "raw" DOM subscription
    var subscribeToEvent = function (el, event, handler) {
        
        if (el.addEventListener) 
            el.addEventListener(event, handler, false)
        else
            if (el.attachEvent)
                el.attachEvent('on' + event, handler)
            else
                throw "Can't subscribe to event"
    } 
    
    var BR                  = t.bowser
    var hasMouseEnter       = BR.msie || BR.gecko && BR.version >= 10 || BR.chrome && BR.version >= 30 || BR.safari
    
    t.testJQuery(function (t) {
        
        t.it('should work', function (t) {
            var parent = Ext.getBody().createChild({
                id : 'parent',
                tag : 'div',
                style: 'margin:20px;width:200px;height:200px;background:#ccc;position: relative;'
            });
    
            var child = parent.createChild({
                id : 'child',
                tag : 'div',
                style: 'position: absolute; left: 50px; top: 50px; width:100px;height:100px;background:#666;;'
            });
    
            var firedParent     = { mouseover : 0, mouseout : 0, mouseenter : 0, mouseleave : 0 },
                firedChild      = { mouseover : 0, mouseout : 0, mouseenter : 0, mouseleave : 0 },
                bubbledToDoc    = false;
                
            var parentMouseMove = 0
            var childMouseMove  = 0
                
            
            subscribeToEvent(parent.dom, 'mouseover', function () {  firedParent.mouseover++; })
            subscribeToEvent(parent.dom, 'mouseout', function () {  firedParent.mouseout++; })
            subscribeToEvent(parent.dom, 'mouseenter', function () {  firedParent.mouseenter++; })
            subscribeToEvent(parent.dom, 'mouseleave', function () {  firedParent.mouseleave++; })
            subscribeToEvent(parent.dom, 'mousemove', function () {  parentMouseMove++; })
    
            subscribeToEvent(child.dom, 'mouseover', function () {  firedChild.mouseover++; })
            subscribeToEvent(child.dom, 'mouseout', function () {  firedChild.mouseout++; })
            subscribeToEvent(child.dom, 'mouseenter', function () {  firedChild.mouseenter++; })
            subscribeToEvent(child.dom, 'mouseleave', function () {  firedChild.mouseleave++; })
            subscribeToEvent(child.dom, 'mousemove', function () {  childMouseMove++; })
            
            subscribeToEvent(t.global.document, 'mousemove', function () { bubbledToDoc = true })
    
            t.moveMouseTo([100, 0], function() {
                t.moveMouseTo([100, 250], function() {
                    
                    // no "mouseenter/leave" events except the IE
                    t.isDeeply(firedChild, {mouseover : 1, mouseout : 1, mouseenter : hasMouseEnter ? 1 : 0 , mouseleave : hasMouseEnter ? 1 : 0}, 'Correct events detected for child');
                    t.isDeeply(firedParent, {mouseover : 3, mouseout : 3, mouseenter : hasMouseEnter ? 1 : 0, mouseleave : hasMouseEnter ? 1 : 0}, 'Correct events detected for parent');
                    
                    t.isGreater(parentMouseMove, 0, "Mouse move fired for parent")
                    t.isGreater(childMouseMove, 0, "Mouse move fired for child")
                    
                    t.ok(bubbledToDoc, '`mousemove` event bubbled up to document')
                });
            });
        })
        
        
        t.it('`mouseenter/leave` should work correctly', function (t) {
            document.body.innerHTML = 
                '<div id="outer" style="position:absolute; width: 100px; height: 100px;left:0;top:0;">' +
                    '<div id="inner" style="position:absolute; width: 50px; height: 50px;left:25px;top:25px">' +
                        'Some text' +
                    '</div>' +
                '</div>'
                    
            t.chain(
                { moveCursorTo : [ 150, 50 ] },
                
                t.getSubTest('going outside', function (t) {
                    t.firesOk('#outer', 'mouseenter', 1)
                    t.firesOk('#outer', 'mouseleave', 0)
                    t.firesOk('#inner', 'mouseenter', 1)
                    t.firesOk('#inner', 'mouseleave', 0)
                    
                    t.chain(
                        { moveCursorTo : [ 50, 50 ] }
                    )
                })
                
            )
        })
    });
});
