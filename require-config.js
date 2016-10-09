requirejs.config({
    // base url of source files
    baseUrl: 'lib',
    // library paths
    paths:{
        "jquery":'libraries/jquery.min',
        "howler":'libraries/howler.min',
        "zip":'libraries/zip'
    }
});

// load test file relative to the base url
// requirejs(['main/main']);
requirejs(['main']);
