/**
 * The main file that starts the module loader and creates the main container
 * @class Main
 */

// full jquery import here (not needed elsewhere)
import * as $ from 'jquery';

import { ModuleLoader } from './module-loader';

$(document).ready(function(){
    console.log('Starting Application');

    let main_element = $('<div id="main_container" style="width: 100vw; height: 100vh; overflow: hidden"></div>');

    $('body').append(main_element);

    ModuleLoader(main_element);
});
