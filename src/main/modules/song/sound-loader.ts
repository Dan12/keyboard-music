/// <reference path="../files/file-manager.ts"/>

function loadSounds(urls: string[], callback: () => void) {
    let i = 0;

    let nextUrl = () => {
      i++;
      if (i >= urls.length) {
        console.log('Finished loading sounds');
        callback();
        return;
      }
      NewZip.loadZip(urls[i], nextUrl);
    };

    NewZip.loadZip(urls[i], nextUrl);
}
