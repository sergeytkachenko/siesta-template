/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TestGrid', {
    extend     : 'Ext.tree.Panel',
    alias      : 'widget.testgrid',
    
    requires   : [
        'Siesta.Harness.Browser.UI.FilterableTreeView',
        'Siesta.Harness.Browser.UI.TestGridController',
        'Siesta.Harness.Browser.UI.TestNameColumn'
    ],
    
    controller  : 'testgrid',

    stateful                : true,
    rootVisible             : false,
    header                  : false,
    rowLines                : false,
    useArrows               : true,
    border                  : false,
    cls                     : 'tr-testgrid',
    iconCls                 : 'tr-status-neutral-small',
    width                   : 340,
    collapsible             : true,
    expanded                : true,
    viewType                : 'filterabletreeview',
    enableColumnMove        : false,
    
    harness                 : null,
    lines                   : false,
    
    filter                  : null,
    filterGroups            : false,
    
    resultSummary           : null,
    
    stateConfig             : null,
    
    showSizeControls        : false,
    
    coverageReportButton    : null,
    
    isReadOnlyReport        : false,
    
    menuHideTimeout         : false,

    viewConfig : {
        enableTextSelection : true,
        toggleOnDblClick    : false,
        markDirty           : false,
        trackOver           : false,
        getRowClass         : function(record) {
            if (record.get('descriptor').isSystemDescriptor) {
                return 'siesta-system-descriptor';
            }
        },

        // Avoid DOM updates when irrelevant
        shouldUpdateCell    : function(record, column, changedFieldNames) {

            if (column.dataIndex === 'passCount' &&
                changedFieldNames &&
                !(
                    Ext.Array.contains(changedFieldNames, 'passCount') ||
                    Ext.Array.contains(changedFieldNames, 'todoPassCount')
                )
            ) {
                return 0;
            }

            if (column.dataIndex === 'failCount' &&
                changedFieldNames &&
                !(
                    Ext.Array.contains(changedFieldNames, 'failCount') ||
                    Ext.Array.contains(changedFieldNames, 'todoFailCount')
                )
            ) {
                return 0;
            }
            
            return Ext.tree.View.prototype.shouldUpdateCell.apply(this, arguments);
        }
    },

    initComponent : function () {
        var me      = this;
        var R       = Siesta.Resource('Siesta.Harness.Browser.UI.TestGrid');
        var state   = this.stateConfig;

        Ext.apply(this, {
            title      : R.get('title'),

            columns : {
                // Hack, prevent Ext JS grid column to react to click/keys in filter field
                createFocusableContainerKeyNav  : Ext.emptyFn,
                // EOF Hack
                items                        : [
                    {
                        xtype   : 'testnamecolumn',
                        store   : this.store,
                        harness : this.harness
                    },
                    {
                        header       : R.get('passText'),
                        width        : 35,
                        sortable     : false,
                        tdCls        : 'x-unselectable',
                        menuDisabled : true,
                        dataIndex    : 'passCount',
                        align        : 'center',
                        tdCls        : 'result-cell',
                        renderer     : this.passedColumnRenderer,
                        scope        : this
                    },
                    {
                        header       : R.get('failText'),
                        width        : 35,
                        sortable     : false,
                        tdCls        : 'x-unselectable',
                        menuDisabled : true,
                        dataIndex    : 'failCount',
                        align        : 'center',
                        tdCls        : 'result-cell',
                        renderer     : this.failedColumnRenderer,
                        scope        : this
                    },
                    { 
                        header      : 'Time', 
                        width       : 50, 
                        sortable    : false, 
                        dataIndex   : 'time', 
                        align       : 'center',
                        renderer    : function (value, meta, record) { 
                            if (!record.isLeaf()) return ''
                            return value + 'ms';
                        },
                        hidden      : !(this.harness.showTestDurationColumn || this.isReadOnlyReport) 
                    }
                ]
            },

            bbar : {
                xtype    : 'toolbar',
                cls      : 'main-bbar siesta-toolbar',
                border   : false,
                height   : 45,
                defaults : {
                    scale       : 'large',
                    width       : 30,
                    tooltipType : 'title'
                },

                items : this.getBottomBarItems(state, R)
            },

            dockedItems : this.showSizeControls ? [
                {
                    xtype  : 'toolbar',
                    cls    : 'size-toolbar',
                    border : true,
                    dock   : 'bottom',
                    items  : [
                        {
                            xtype     : 'slider',
                            itemId    : 'framesizeSlider',
                            width     : 130,
                            value     : 3,
                            increment : 1,
                            minValue  : 0,
                            maxValue  : this.viewportSizes.length - 1,
                            listeners : {
                                change : this.onDimensionOrOrientationChange,
                                scope  : this
                            }
                        },
                        {
                            xtype  : 'label',
                            cls    : 'size-label',
                            itemId : 'sizeLabel',
                            width  : 65
                        },
                        {
                            boxLabel  : R.get('landscape'),
                            itemId    : 'orientationCheckbox',
                            xtype     : 'checkbox',
                            checked   : true,
                            listeners : {
                                change : this.onDimensionOrOrientationChange,
                                scope  : this
                            }
                        }
                    ]
                }
            ] : []
        })

        this.callParent(arguments);

        var me = this

        this.getView().on('beforerefresh', function () {
            var trigger = me.down('#trigger')

            if (me.filterGroups)    trigger.setFilterGroups(me.filterGroups)
            if (me.filter)          trigger.setValue(me.filter)

            // cancel refresh if there's a filter - in this case an additional refresh will be triggered by
            // the filtering which will be already not canceled since this is 1 time listener
            return !me.filter
        }, null, { single : true })

        this.on('viewready', this.onMyViewReady, this, { delay : 10 });

        this.coverageReportButton = this.down('[actionName=show-coverage]');
    },
    
    
    getBottomBarItems : function (state, R) {
        var items       = []
        
        if (!this.isReadOnlyReport) { 
            items.push(
                {
                    glyph      : 0xf04b,
                    cls        : 'run-checked',
                    text       : '<span class="subicon fa-check"></span>',
                    tooltip    : R.get('runCheckedText'),
                    actionName : 'run-checked'
                },
                {
                    glyph      : 0xf04e,
                    cls        : 'run-all',
                    tooltip    : R.get('runAllText'),
                    actionName : 'run-all'
                },
                {
                    glyph      : 0xf04b,
                    cls        : 'run-failed',
                    text       : '<span class="subicon fa-bug"></span>',
                    tooltip    : R.get('runFailedText'),
                    actionName : 'run-failed'
                },
                {
                    glyph      : 0xf02d,
                    tooltip    : R.get('showCoverageReportText'),
                    cls        : 'show-coverage',
                    actionName : 'show-coverage',
                    disabled   : true
                },
                {
                    glyph   : 0xf013,
                    tooltip : R.get('optionsText'),
                    cls     : 'options',
                    action  : 'options',
                    
                    listeners : {
                        mouseover       : this.onOptionsButtonMouseOver,
                        mouseout        : this.onOptionsButtonMouseOut,
                        scope           : this
                    },
                    
                    menu    : {
                        itemId : 'tool-menu',

                        listeners   : {
                            mouseenter  : {
                                fn      : this.onOptionsMenuMouseEnter,
                                // delay to cancel the hide _after_ the "mouseleave" from the sub-menu
                                delay   : 100
                            },
                            mouseover   : {
                                fn      : this.onOptionsMenuMouseEnter,
                                delay   : 100
                            },
                            mouseleave  : this.onOptionsMenuMouseLeave,
                            scope       : this
                        },

                        items  : [
                            {
                                text    : R.get('mouseSimulation'),
                                iconCls : 'x-fa fa-mouse-pointer',
                                menu    : {
                                    listeners   : {
                                        mouseenter  : this.onOptionsMenuMouseEnter,
                                        mouseleave  : this.onOptionsMenuMouseLeave,
                                        scope       : this
                                    },
                                    items   : [
                                        {
                                            text    : "Slow (accurate)",
                                            option  : 'mouseSimSlow',
                                            checked : !state.speedRun && !state.superSpeedRun,

                                            group   : 'mouse-sim',

                                            tooltip : "Slow and accurate mouse simulation"
                                        },
                                        {
                                            text    : "Fast (accurate)",
                                            option  : 'mouseSimFast',
                                            checked : state.speedRun && !state.superSpeedRun,

                                            group   : 'mouse-sim',

                                            tooltip : "Fast, but still accurate mouse simulation"
                                        },
                                        {
                                            text    : "Fastest (not accurate)",
                                            option  : 'mouseSimFastest',
                                            checked : state.superSpeedRun,

                                            group   : 'mouse-sim',

                                            tooltip : R.get('superSpeedRunTooltip')
                                        }
                                    ]
                                }
                            },
                            {
                                text    : R.get('transparentExText'),
                                option  : 'transparentEx',
                                checked : state.transparentEx,

                                tooltip : R.get('transparentExTooltip')
                            },
//                            {
//                                text    : R.get('cachePreloadsText'),
//                                option  : 'cachePreload',
//                                checked : state.cachePreload
//                            },
                            {
                                text    : R.get('breakOnFailText'),
                                option  : 'breakOnFail',
                                checked : state.breakOnFail,

                                tooltip : R.get('breakOnFailTooltip')
                            },
                            {
                                text    : R.get('debuggerOnFailText'),
                                option  : 'debuggerOnFail',
                                checked : state.debuggerOnFail,

                                tooltip : R.get('debuggerOnFailTooltip')
                            },
                            {
                                text    : R.get('observerModeText'),
                                option  : 'observerMode',
                                checked : state.observerMode,

                                tooltip : R.get('observerModeTooltip')
                            },
                            {
                                text    : R.get('autoLaunchText'),
                                option  : 'autoRun',
                                checked : state.autoRun,

                                tooltip : R.get('autoLaunchTooltip')
                            },
                            { xtype : 'menuseparator' },
                            {
                                text   : R.get('aboutText'),
                                itemId : 'aboutSiesta'
                            },
                            {
                                text       : R.get('documentationText'),
                                href       : R.get('siestaDocsUrl'),
                                hrefTarget : '_blank'
                            }
                        ]
                    }
                }
            )
        }
        
        items.push(
            '->',
            {
                xtype  : 'component',
                cls    : 'summary-bar',
                border : false,
                width  : 55,
                itemId : 'result-summary',
                data   : {
                    pass : 0,
                    fail : 0
                },
                tpl    : '<div><span class="total-pass">{pass}</span><span class="icon fa-check"></span></div><div><span class="total-fail">{fail}</span><span class="icon fa-bug"></span></div>'
            }
        )
        
        return items
    },

    onHistoryChange : function(token) {
        if (token) {
            var testFile = this.store.getNodeById(token)

            if (testFile) {
                this.selectTestFile(testFile);
            }
        }
    },

    onDimensionOrOrientationChange : function (slider, val) {
        var newSize = this.viewportSizes[this.framesizeSlider.getValue()];
        var landscape = this.orientationCheckbox.getValue();

        this.sizeLabel.setText(newSize.join('x'));
        this.fireEvent('framesizechange', slider, newSize[0], newSize[1], landscape);
    },


    getFilterValue : function () {
        return this.down('#trigger').getValue()
    },


    getFilterGroups : function () {
        return this.down('#trigger').getFilterGroups()
    },


    passedColumnRenderer : function (value, meta, record) {
        if (!record.isLeaf()) return ''

        if (record.data.todoPassCount > 0) {
            value += ' <span title="' + record.data.todoPassCount + ' ' + Siesta.Resource('Siesta.Harness.Browser.UI.TestGrid', 'todoPassedText') + '" class="tr-test-todo tr-test-todo-pass">+ ' + record.data.todoPassCount + '</span>';
        }

        return value;
    },


    failedColumnRenderer : function (value, meta, record) {
        if (!record.isLeaf()) return ''

        if (record.data.todoFailCount > 0) {
            value += ' <span title="' + record.data.todoFailCount + ' ' + Siesta.Resource('Siesta.Harness.Browser.UI.TestGrid', 'todoFailedText') + '" class="tr-test-todo tr-test-todo-fail">+ ' + record.data.todoFailCount + '</span>';
        }
        return value;
    },
    
    
    onOptionsButtonMouseOver : function (button) {
        clearTimeout(this.menuHideTimeout)
        
        button.showMenu()
        
        button.menu.hide = function () {}
        setTimeout(function () {
            delete button.menu.hide
        }, 1000)
    },


    onOptionsButtonMouseOut : function (button) {
        var me      = this
        
        if (this.menuHideTimeout) return
        
        this.menuHideTimeout = setTimeout(function () {
            delete button.menu.hide
            button.hideMenu()
            
            me.menuHideTimeout  = null
        }, 500)
    },
    
    
    onOptionsMenuMouseEnter : function (menu) {
        clearTimeout(this.menuHideTimeout)
        
        this.menuHideTimeout    = null
    },
    
    
    onOptionsMenuMouseLeave : function () {
        var me          = this
        var menu        = this.down('#tool-menu')
        
        if (this.menuHideTimeout) return
        
        this.menuHideTimeout = setTimeout(function () {
            delete menu.hide
            menu.hide()
            
            me.menuHideTimeout  = null
        }, 500)
    },
    
    
    afterRender : function () {
        this.callParent(arguments);

        this.summaryPassEl  = this.el.down('.total-pass');
        this.summaryFailEl  = this.el.down('.total-fail');

        if (this.showSizeControls) {
            this.orientationCheckbox    = this.down('#orientationCheckbox');
            this.sizeLabel              = this.down('#sizeLabel');
            this.framesizeSlider        = this.down('#framesizeSlider');

            var size                    = this.viewportSizes[ this.framesizeSlider.getValue() ];
            
            this.sizeLabel.setText(size.join('x'));
        }
    },

    onMyViewReady : function() {
        Ext.History.on('change', this.onHistoryChange, this);

        var hash = window.location.hash;

        if (hash) {
            this.onHistoryChange(hash.substring(1));
        }
    },

    updateStatus : function (pass, fail) {
        this.summaryPassEl.update(String(pass));
        this.summaryFailEl.update(String(fail));
    },

    enableCoverageButton : function () {
        this.coverageReportButton.enable()
    },

    disableCoverageButton : function () {
        this.coverageReportButton.disable()
    },
    
    
    setFilterValue : function (value) {
        this.down('treefilter').setValue(value)
    },

    selectTestFile : function(testFile) {
        if (testFile) {
            testFile.bubble(function(parent) { parent.expand(); });

            // Make sure test is not filtered out
            if (this.store.getById(testFile.id) && this.store.indexOf(testFile) >= 0 ) {
                if (!this.getCollapsed() && this.getView().getNodes().length > 0) {
                    this.ensureVisible(testFile);
                }
                this.getSelectionModel().select(testFile)
            }
        }
    }
})
