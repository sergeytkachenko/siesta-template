/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Recorder.Role.CanSwallowException', {

    does : [
        JooseX.Observable
    ],

    has : {
        swallowExceptions   : false
    },


    methods : {
        
        safeBind : function (func, scope) {
            var me      = this
            scope       = scope || me
            
            // extra protection from the exceptions from the recorder itself
            if (me.swallowExceptions) {
                
                return function () {
                    try {
                        return func.apply(scope, arguments)
                    } catch(e) {
                        me.fireEvent('exception', e);
                    }
                }
            } else {
                return func.bind(scope)
            }
        }
    }
    // eof methods
});
