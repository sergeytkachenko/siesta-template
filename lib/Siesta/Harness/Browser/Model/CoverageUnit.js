/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.Model.CoverageUnit', {
    extend      : 'Ext.data.Model',

    idProperty : 'id',

    fields : [
        'id',
        'url',
        'text',
        'reportNode',
        { name : 'iconCls', defaultValue : 'x-fa fa-cube'}
    ],

    getLineCoverage : function() {
        return this.getCoverageInPercent('lines');
    },

    getStatementCoverage : function() {
        return this.getCoverageInPercent('statements');
    },

    getBranchCoverage : function() {
        return this.getCoverageInPercent('branches');
    },

    getFunctionCoverage : function() {
        return this.getCoverageInPercent('functions');
    },

    getCoverageInPercent : function(type) {
        var node = this.data.reportNode;

        if (node) {
            return node.metrics[type].pct;
        }
    }
//            ,
        
//            init        : function () {
//                this.internalId = this.getId() || this.internalId
//            },
//    
//            computeFolderStatus : function () {
//                if (!this.childNodes.length) return 'yellow'
//    
//                var isWorking = false
//                var hasFailed = false
//                var allGreen = true
//    
//                Joose.A.each(this.childNodes, function (childNode) {
//    
//                    if (childNode.isLeaf()) {
//                        var test = childNode.get('test')
//    
//                        if (test && test.isFailed()) {
//                            allGreen = false
//                            hasFailed = true
//    
//                            // stop iteration
//                            return false
//                        }
//    
//                        if (!test && childNode.get('isStarting'))    isWorking = true
//                        if (test && !test.isFinished())     isWorking = true
//                        if (test && !test.isPassed())       allGreen = false
//                        if (!test)                          allGreen = false
//    
//                    } else {
//                        var status = childNode.computeFolderStatus()
//    
//                        if (status == 'red') {
//                            allGreen = false
//                            hasFailed = true
//    
//                            // stop iteration
//                            return false
//                        }
//    
//                        if (status == 'working') {
//                            isWorking = true
//    
//                            // stop iteration
//                            return false
//                        }
//    
//                        if (status == 'yellow')         allGreen = false
//                    }
//                })
//    
//                if (isWorking)  return 'working'
//                if (hasFailed)  return 'red'
//                if (allGreen)   return 'green'
//    
//                return 'yellow'
//            },
//    
//    
//            updateFolderStatus : function () {
//                this.set('folderStatus', this.computeFolderStatus())
//    
//                var parentNode = this.parentNode
//    
//                if (parentNode && !parentNode.isRoot()) parentNode.updateFolderStatus()
//            }
    }, 
    // eof Ext.apply
    
    function () {
        Ext.data.NodeInterface.decorate(this);

        this.override({
            expand : function () {
                Ext.suspendLayouts();
                this.callParent(arguments);
                Ext.resumeLayouts();
            }
        });
    }
)
