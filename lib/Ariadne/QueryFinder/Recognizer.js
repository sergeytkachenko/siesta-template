/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Ariadne.QueryFinder.Recognizer', {

    has        : {
        finder          : { required : true },
        
        priority        : 100
    },
    

    methods : {
        
        /**
            Should operate on the maze, and, using some apriori knowledge about maze structure 
            and specificity, add some edges to it, using Node api
         */
        recognize : function (maze) {
            throw new Error("Abstract method called: `recognize`")
        }
    }
});
