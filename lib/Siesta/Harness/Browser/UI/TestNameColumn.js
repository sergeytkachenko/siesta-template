/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TestNameColumn', {
    extend       : 'Ext.tree.Column',
    xtype        : 'testnamecolumn',
    
    requires        : [
        'Siesta.Harness.Browser.UI.TreeFilterField'
    ],    
    
    sortable     : false,
    dataIndex    : 'title',
    menuDisabled : true,
    flex         : 1,
    tdCls        : 'test-name-cell',
    harness      : null,
    scope        : this,
    filterGroups : null,
    store        : null,

    initComponent : function () {

        var R = Siesta.Resource('Siesta.Harness.Browser.UI.TestGrid');

        Ext.apply(this, {
            items : [
                {
                    xtype        : 'treefilter',
                    emptyText    : R.get('filterTestsText'),
                    margins      : '0 0 0 10',
                    itemId       : 'trigger',
                    filterGroups : this.filterGroups,
                    filterField  : 'title',
                    store        : this.store,
                    tipText      : R.get('filterFieldTooltip')
                }
            ]
        });

        this.callParent(arguments);
    },

    // HACK OVERRIDE
    treeRenderer : function (value, metaData, testFile) {
        metaData.tdCls  = 'test-name-cell-' + (testFile.data.leaf ? 'leaf' : 'parent');
        
        var iconCls     = ''

        if (testFile.isLeaf()) {
            var test = testFile.get('test')

            if (test) {
                if (testFile.get('isFailed'))
                    iconCls = 'siesta-test-failed fa-flag'

                else if (testFile.get('isRunning') && !test.isFinished())
                    iconCls = 'fa-flash siesta-running-not-finished'
                else if (test.isFinished()) {

                    if (test.isPassed())
                        iconCls = 'fa-check siesta-test-passed'
                    else
                        iconCls = 'fa-bug siesta-test-failed'
                } else
                    iconCls = 'fa-hourglass-o siesta-test-starting'

            } else {
                if (testFile.get('isMissing'))
                    iconCls = 'fa-close siesta-test-file-missing'
                else if (testFile.get('isStarting'))
                    iconCls = 'fa-hourglass-o siesta-test-starting'
                else
                    iconCls = this.getTestIcon(testFile) + ' siesta-test-file'
            }
        } else {
            var status = testFile.get('folderStatus');

            if (status == 'working') {
                iconCls = ' fa-hourglass-o siesta-folder-running';
            } else if (status == 'green') {
                iconCls = ' fa-check siesta-folder-pass';
            } else if (status == 'red') {
                iconCls = ' fa-bug siesta-folder-fail';
            } else {
                iconCls = '';
            }
        }
        
        testFile.data.iconCls   = iconCls

        if (testFile.isLeaf()) {
            metaData.tdAttr  = 'title="' + value + '"';
        }
        return this.callParent(arguments);
    },

    getTestIcon : function(test) {
        if (this.harness.getDescriptorConfig(test.get('descriptor'), 'pageUrl')) {
            return 'fa-desktop';  // Application test
        } else {
            return 'fa-file-o';  // Unit test
        }
    },

    renderer : function(v, m, r) {
        return v;
    }
})
