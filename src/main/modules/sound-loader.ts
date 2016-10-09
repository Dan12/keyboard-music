import { FileManager } from './file-manager';
import { ZipHandler } from './zip_handler';

let i: number;
let zipUrls: string[];

export function loadSounds(urls: string[], destination: FileManager) {
    ZipHandler.initialize(destination);
    i = -1;
    zipUrls = urls;
    getNextUrl();
}

function getNextUrl() {
  i++;
  if (i >= zipUrls.length) {
    return;
  }
  ZipHandler.loadZip(zipUrls[i], getNextUrl);
}
