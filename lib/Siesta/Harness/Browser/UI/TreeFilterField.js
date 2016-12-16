/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TreeFilterField', {
    extend : 'Ext.form.field.Text',
    alias  : 'widget.treefilter',

    filterGroups : false,
    cls          : 'filterfield',

    store : null,

    filterField : 'text',

    hasAndCheck     : null,
    andChecker      : null,
    andCheckerScope : null,

    triggerLeafCls  : 'fa-file-o',
    triggerGroupCls : 'fa-folder-o',
    tipText         : null,

    
    constructor : function (config) {
        var me          = this;
        
        Ext.apply(config, {
            triggers : {
                clear : {
                    cls     : 'fa-close',
                    handler : function () {
                        me.store.clearTreeFilter()
                        me.reset()
                    }
                },

                leafOrGroup : {
                    cls     : me.triggerLeafCls,
                    handler : function () {
                        me.setFilterGroups(!me.getFilterGroups())
                    }
                }
            },

            listeners : {
                change     : {
                    fn         : this.onFilterChange,
                    buffer     : 400,
                    scope      : this
                },

                specialkey : this.onFilterSpecialKey,
                scope      : this
            }
        })

        this.callParent(arguments);
    },


    afterRender : function () {
        this.callParent(arguments)

        this.tipText && this.inputEl.set({ title : this.tipText })

        if (this.filterGroups) {
            this.triggerEl.item(1).addCls(this.triggerGroupCls)
            this.triggerEl.item(1).removeCls(this.triggerLeafCls)
        }
    },


    onFilterSpecialKey : function (field, e, t) {
        if (e.keyCode === e.ESC) {
            this.store.clearTreeFilter()
            field.reset();
        }
    },


    setFilterGroups : function (value) {
        if (value != this.filterGroups) {
            this.filterGroups = value

            if (this.rendered) {
                var el = this.triggerEl.item(1)

                if (value) {
                    el.addCls(this.triggerGroupCls)
                    el.removeCls(this.triggerLeafCls)
                } else {
                    el.removeCls(this.triggerGroupCls)
                    el.addCls(this.triggerLeafCls)
                }
            }

            this.refreshFilter()

            this.fireEvent('filter-group-change', this)
        }
    },


    getFilterGroups : function () {
        return this.filterGroups
    },


    refreshFilter : function () {
        this.onFilterChange(this, this.getValue())
    },
    
    
    onFilterChange : function (field, filterValue) {
        if (filterValue || this.hasAndCheck && this.hasAndCheck()) {
            var filterer        = this.store.filterer
            var fieldName       = this.filterField

            var testFilterRegexps
            var groupFilterRegexps
            
            var filterGroups    = this.filterGroups
            
            if (filterGroups) {
                testFilterRegexps   = filterer.splitTermByPipe(filterValue)
            } else {
                var res             = filterer.parseFilterValue(filterValue)
                
                testFilterRegexps   = res.testFilterRegexps
                groupFilterRegexps  = res.groupFilterRegexps
            }
            
            var andChecker          = this.andChecker
            var andCheckerScope     = this.andCheckerScope || this
            
            var getTitle            = function (node) { return node.get(fieldName) }
            
            this.store.filterTreeBy({
                filter               : function (node) {
                    if (andChecker && !andChecker.call(andCheckerScope, node)) return false
                    
                    return filterer.checkCommonFilter(node, getTitle, testFilterRegexps, groupFilterRegexps)
                },
                fullMatchingParents : filterGroups
            })
        } else {
            this.store.clearTreeFilter()
        }
    }
})
