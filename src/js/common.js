requirejs.config({

    baseUrl: './src/js', //!!! relative to html

    text: {
        useXhr: function(url, protocol, hostname, port) {
            // allow cross-domain requests
            // remote server allows CORS
            return true;
        }
    },

    shim: {

        'tween': { 
            exports: 'Tween' 
        },

        'rstats': { 
            exports: 'rStats'
        },

        'detector':{
            exports:"Detector"
        },

        'datgui':{
            exports:"GUI"
        },

        'babylon': { 
            exports: 'BABYLON',
            deps:["raf"],
            init: function(raf) {
                //Using a function allows you to call noConflict for
                //libraries that support it, and do other cleanup.
                //However, plugins for those libraries may still want
                //a global. "this" for the function will be the global
                //object. The dependencies will be passed in as
                //function arguments. If this function returns a value,
                //then that value is used as the module export value
                //instead of the object found via the 'exports' string.
                //return this.Foo.noConflict();
            }
        }

    },

    paths: {
    	
        "domready": "lib/require/domReady",  
        "text": "lib/require/text",       
        
        "babylon" :"lib/babylon/babylon",

        "requireLib" :"lib/require/require.min",        
    
        "datgui": "lib/dat.gui.min",
        "tween": "lib/Tween",
        "rstats": "lib/rStats",
        "detector": "lib/detector",	
        "raf": "lib/raf"
    }

});
