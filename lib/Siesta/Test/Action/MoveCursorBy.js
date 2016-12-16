/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Test.Action.MoveCursorBy
@extends Siesta.Test.Action

Action which moves the cursor by an x/y delta, call it with the "moveCursorBy" shortcut:

    t.chain(
        {
            moveCursorBy : [ 100, 100 ]
        },
        ...
    )

*/
Class('Siesta.Test.Action.MoveCursorBy', {
    
    isa         : Siesta.Test.Action,
    
    does        : [
        Siesta.Test.Action.Role.HasTarget,
        Siesta.Util.Role.CanGetType
    ],
    
    has : {
        requiredTestMethod  : 'moveMouseBy'
    },

    
    methods : {
        process : function () {
            var test = this.test;
            var next = this.next;
            
            if (this.target && this.typeOf(this.target) == 'Array' && this.typeOf(this.target[ 0 ]) == 'Array') {
                this.target     = this.target[ 0 ]
            }

            test.moveMouseBy(this.getTarget(), this.next);
        }
    }
});


Siesta.Test.ActionRegistry().registerAction('moveMouseBy', Siesta.Test.Action.MoveCursorBy)
Siesta.Test.ActionRegistry().registerAction('moveCursorBy', Siesta.Test.Action.MoveCursorBy)
Siesta.Test.ActionRegistry().registerAction('moveFingerBy', Siesta.Test.Action.MoveCursorBy)
