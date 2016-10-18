/// <reference path="./file-manager.ts"/>
/// <reference path="./zip_handler.ts"/>

let i: number;
let zipUrls: string[];

function loadSounds(urls: string[], destination: FileManager) {
    ZipHandler.initialize(destination);
    i = -1;
    zipUrls = urls;
    getNextUrl();
}

function getNextUrl() {
  i++;
  if (i >= zipUrls.length) {
    console.log('Finished loading sounds');
    return;
  }
  ZipHandler.loadZip(zipUrls[i], getNextUrl);
}
