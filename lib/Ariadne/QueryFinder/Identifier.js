/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder.Identifier', {
    
    does        : Siesta.Util.Role.CanMergeArrayAttributeFromClassHierarchy,

    has        : {
        finder          : { required : true },
        
        priority        : 100
    },
    

    methods : {
        
        /**
            Should returns a single "segment" or an array of segments, or null
            
            A segment:
            
            - a string with query - will be assigned default weight of 1000
            
            - an object:
                {
                    query           : String,
                    weight          : Number, // optional, default is 1000
                    
                    // indicates that segment should be the 1st one in the query component
                    leading         : Boolean, // optional
                    
                    // indicates that query component with this segment should be combined 
                    // with previous one using '>'
                    child           : Boolean
                }

         */
        identify : function (target, root, maze) {
            return []
        }
    }
});
