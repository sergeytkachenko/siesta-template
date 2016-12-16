/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder.Combinator', {
    
    has        : {
        elements                    : { required : true },
        
        currentCombLen              : null,
        
        combination                 : null
    },
    

    methods : {
        
        forAllCombinations : function (func) {
            var elements    = this.elements
            var elemLength  = elements.length
            
            var combination = this.combination
            
            for (var combLen = combination ? combination.length : 1; combLen <= elemLength; combLen++) {
                combination         = this.forAllCombinationsOfLength(combLen, func, combination)
                
                this.combination    = combination
                
                if (combination) return false
            }
        },
        
        
        forAllCombinationsOfLength : function (combLen, func, combination) {
            var elements    = this.elements
            var elemLength  = elements.length
            
            if (combLen > elemLength) return
            
            if (!combination) {
                combination = new Array(combLen)
            
                for (var i = 0; i < combLen; i++) {
                    combination[ i ] = { current : i, max : elemLength - combLen + i }
                }
            }
            
            if (combination.length != combLen) throw new Error("Wrong combination state")
            
            var shouldStop
            
            do {
                var collected       = []
                
                for (var k = 0; k < combLen; k++) {
                    collected.push(elements[ combination[ k ].current ])
                }
                
                if (func(collected) === false) return combination
                
                shouldStop          = true
            
                for (var i = combLen - 1; i >= 0; i--) {
                    var combAt      = combination[ i ]
                    
                    if (combAt.current < combAt.max) {
                        combAt.current++
                        
                        shouldStop  = false
                        
                        for (var j = i + 1; j < combLen; j++) {
                            combination[ j ].current = combination[ j - 1 ].current + 1
                        }
                        
                        break
                    }
                }
            } while (!shouldStop)
        }
    }
});
