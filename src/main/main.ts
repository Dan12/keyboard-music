/**
 * The main file that starts the module loader and creates the main container
 * @class Main
 */

// library imports
/// <reference path="../libraries/howler.d.ts"/>
/// <reference path="../libraries/jquery.d.ts"/>
/// <reference path="../libraries/zip.d.ts"/>
/// <reference path="../libraries/jszip.d.ts"/>

/// <reference path="./module-loader.ts"/>

$(document).ready(function(){
    console.log('Starting Application');

    let main_element = $('<div id="main_container" style="width: 100vw; height: 100vh; overflow: hidden"></div>');

    $('body').append(main_element);

    ModuleLoader(main_element);
});
