// full jquery import here (not needed elsewhere)
import * as $ from 'jquery';

$(document).ready(function(){
    console.log('Starting Application');

    let main_element = $('<div id="main_container" style="width: 100vw; height: 100vh; overflow: hidden"></div>');

    $('body').append(main_element);
});
