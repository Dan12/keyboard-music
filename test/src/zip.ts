/// <reference path="libraries/jszip.d.ts"/>

class ZipHandler {

  public static loadFile(zipBlob: any, loadedCB: (name: string, data: ArrayBuffer) => void) {
    let zip = new JSZip();

    zip.loadAsync(zipBlob).then(function(zip) {
      zip.forEach(function (relativePath, zipEntry) {
        if (zipEntry.name.endsWith(".mp3")) {
          zipEntry.async("arraybuffer").then(function(data) {
            loadedCB(zipEntry.name, data);
          });
        } else {
          console.log("warning: non mp3: " + zipEntry.name);
        }
      });
    }, function (e) {
      console.log(e);
    });
  }
}