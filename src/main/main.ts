// library imports
/// <reference path="../libraries/howler.d.ts"/>
/// <reference path="../libraries/jquery.d.ts"/>
/// <reference path="../libraries/jszip.d.ts"/>
/// <reference path="../libraries/misc.d.ts"/>

/// <reference path="./module-loader.ts"/>
/// <reference path="./tests.ts"/>
/// <reference path="./test-mobile.ts"/>

/**
 * The main function that starts the module loader and creates the main container
 */
$(document).ready(function(){
    console.log('Starting Application');

    // add the main container element to the dom
    let main_element = new JQW('<div id="main_container" style="width: 100vw; height: 100vh; overflow: hidden"></div>');

    (new JQW('body')).append(main_element);

    if (testMobile()) {
      main_element.append('<div>This application is currently not supported for mobile</div>');
    } else {
      runTests(() => {
        // call the module loader
        ModuleLoader(main_element);
      });
    }
});
