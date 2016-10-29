/// <reference path="../files/file-manager.ts"/>
/// <reference path="../zip-handler.ts"/>

function loadSounds(urls: string[], callback: () => void) {
    ZipHandler.initialize();
    let i = 0;

    let nextUrl = () => {
      i++;
      if (i >= urls.length) {
        console.log('Finished loading sounds');
        callback();
        return;
      }
      ZipHandler.loadZip(urls[i], nextUrl);
    };

    ZipHandler.loadZip(urls[i], nextUrl);
}
