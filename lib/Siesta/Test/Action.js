/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Action

Base class for {@link Siesta.Test#chain} actions.

*/
Class('Siesta.Test.Action', {
    
    has : {
        args                : null, 
        
        /**
         * @cfg {String} desc When provided, once step is completed, a passing assertion with this text will be added to a test.
         * This configuration option can be useful to indicate the progress of "wait" steps  
         */
        desc                : null,
        test                : { required : true },
        next                : { required : true },
        
        requiredTestMethod  : null
    },

    
    methods : {
        
        initialize : function () {
            var requiredTestMethod  = this.requiredTestMethod
            
            // additional sanity check
            if (requiredTestMethod && !this.test[ requiredTestMethod ]) 
                throw new Error(Siesta.Resource('Siesta.Test.Action','missingTestAction').replace('{0}', this.meta.name).replace('{1}', requiredTestMethod))
        },
        
        
        process : function () {
            this.next()
        }
    }
});
