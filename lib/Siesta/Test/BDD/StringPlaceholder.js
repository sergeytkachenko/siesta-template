/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Test.BDD.StringPlaceholder', {
    
    does        : [
        Siesta.Util.Role.CanGetType,
        Siesta.Test.Role.Placeholder
    ],
    
    has         : {
        value           : { required : true }
    },
    
    
    methods     : {
        
        equalsTo : function (string) {
            if (this.typeOf(this.value) == 'RegExp')
                return this.value.test(string)
            else
                return String(string).indexOf(this.value) > -1
        },
        
        
        toString : function () {
            if (this.typeOf(this.value) == 'RegExp')
                return 'any string matching: ' + this.value
            else
                return 'any string containing: ' + this.value
        }
    }
})
