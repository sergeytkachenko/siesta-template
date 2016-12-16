StartTest(function (t) {
    
    var panel, extractor;

    t.beforeEach(function() {
        panel && panel.destroy();

        extractor       = new Siesta.Recorder.TargetExtractor.ExtJS()
        extractor.setExt(document.body);
    })

    t.it('Extracting composite query should work', function (t) {
        var tbar, bbar

        panel               = new Ext.panel.Panel({
            renderTo : document.body,
            items    : [
                {
                    xtype       : 'container',
                    itemId      : 'bar'
                }
            ],
            
            tbar    : tbar = new Ext.toolbar.Toolbar({
                itemId  : 'top',
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            }),
            
            bbar    : bbar = new Ext.toolbar.Toolbar({
                itemId  : 'bottom',
                
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            })
        })
        
        t.is(extractor.findComponentQueryFor(panel.items.getAt(0)), '#bar', 'Correct component query found')
        
        t.is(extractor.findComponentQueryFor(tbar.items.getAt(0)), '#top button[text=Ok]', 'This query is bad, because it matches more than one component, but the one of interest is the first')
        t.is(extractor.findComponentQueryFor(bbar.items.getAt(0)), '#bottom button[text=Ok]', 'Correct component query found')
    })
    
    
    t.it('Extracting composite query should work', function (t) {
        var tbar, bbar

        panel               = new Ext.panel.Panel({
            renderTo        : document.body,
            
            items   : [
                {
                    xtype       : 'container',
                    itemId      : 'bar',
                    html        : '<p class="bar">Some text</p>'
                }
            ],
            
            tbar    : tbar = new Ext.toolbar.Toolbar({
                items : [
                    { text        : 'Ok' },
                    { text        : 'Cancel' }
                ]
            }),
            
            bbar    : bbar = new Ext.toolbar.Toolbar({
                itemId  : 'bottom',
                
                items : [
                    { text        : 'Ok'},
                    { text        : 'Cancel' }
                ]
            })
        })

        t.is(extractor.findCompositeQueryFor(panel.items.getAt(0).getEl().down('p').dom), '#bar => .bar', 'Correct composite query found')
        
        t.chain(
            function (next) {
                document.onclick = function (event) {
                    var targets = extractor.getTargets(Siesta.Recorder.Event.fromDomEvent(event))
                    
                    t.isDeeply(targets[ 0 ], { type : 'csq', target : '#bar => .bar', offset : t.any() }, "Correct best target")
                }
                
                t.click(panel.items.getAt(0), next)
            },
            function () {
                document.onclick = null
            }
        )
    })
    
    
    t.it('Extracting composite query should work', function (t) {
        panel               = new Ext.window.Window({
            renderTo    : document.body,
            
            itemId      : 'win',
            x           : 200,
            y           : 0,
            renderTo    : document.body,
            height      : 100,
            width       : 100,
            title       : 'foo'
        })
        
        panel.show()

        var expectedTargets = {
            csq     : '#win title[text=foo] => .x-title-text',
            css     : '.x-title-text',
            cq      : '#win title[text=foo]'
        };

        t.chain(
            function (next) {
                document.onclick = function (event) {
                    var targets = extractor.getTargets(Siesta.Recorder.Event.fromDomEvent(event))
                    
                    t.isDeeply(targets[0], { type : 'csq', target : expectedTargets.csq, offset : null }, "Correct csq target")
                    t.isDeeply(targets[1], { type : 'cq',  target : expectedTargets.cq,  offset : t.any() }, "Correct cq target")
                    t.isDeeply(targets[2], { type : 'css', target : expectedTargets.css, offset : null }, "Correct css target")
                    t.isDeeply(targets[3], { type : 'xy', target : [ t.any(Number), t.any(Number)] }, "Correct xy target")
                    
                }
                
                t.click('>>#win header', next)
            },
            function () {
                document.onclick = null
            }
        )
    })
    
})