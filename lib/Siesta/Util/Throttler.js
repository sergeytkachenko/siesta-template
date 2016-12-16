/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Util.Throttler', {
    
    has     : {
        lastActivationTime  : null,
        
        func                : { required : true },
        scope               : { required : true },
        
        // activate only after this amount of time after last tick (ignoring any preceding ticks)
        buffer              : null,
        
        // activate at least every `throttle` time 
        throttle            : null,
        
        bufferTimeoutId     : null,
        args                : null
    },
    
    
    methods : {
        
        tick        : function () {
            var now                 = new Date() - 0
            
            this.args               = arguments
            
            if (this.throttle != null) {
                if (!this.lastActivationTime) this.lastActivationTime = now
                
                var timeAfterLastActivation = now - this.lastActivationTime
                
                if (timeAfterLastActivation > this.throttle) this.activate()
            }
            
            if (this.buffer != null) {
                var me                  = this
                
                if (this.bufferTimeoutId) clearTimeout(this.bufferTimeoutId)
                
                this.bufferTimeoutId    = setTimeout(function () {
                    me.activate()
                }, this.buffer)
            }
        },
        
        
        activate : function () {
            this.lastActivationTime     = new Date() - 0
            
            if (this.bufferTimeoutId) clearTimeout(this.bufferTimeoutId)
            this.bufferTimeoutId        = null
            
            var args                    = this.args
            this.args                   = null
            
            this.func.apply(this.scope, args)
        },
        
        
        cancel : function () {
            if (this.bufferTimeoutId) clearTimeout(this.bufferTimeoutId)
            
            this.bufferTimeoutId        = null
            this.args                   = null
        },
        
        
        flush : function () {
            if (this.bufferTimeoutId != null) this.activate()
        }
    }
})
