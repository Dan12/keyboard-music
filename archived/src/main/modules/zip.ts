/**
 * The way to load a zip file.
 */
class ZipHandler {
  private static zipBase = 'songs';

  private static numToLoad = 0;
  private static numLoaded = 0;

  // use a queue because the callback operation only allows for 1 file to be processed at a time
  private static queue = <{name: string; callback: () => void; }[]>[];

  /**
   * request to load the contents of the zip file at the given location into the file manager.
   * Only loads .mp3 files and the location has to be a valid zip file
   * @param name the file name/location
   * @param callback optional callback that is called when done loading
   */
  public static requestZipLoad(name: string, callback?: () => void) {
    ZipHandler.queue.push({name, callback});

    if (ZipHandler.queue.length === 1) {
      ZipHandler.popQueue();
    }
  }

  private static popQueue() {
    let top = ZipHandler.queue.pop();

    ZipHandler.loadZip(top.name, top.callback);
  }

  /**
   * start loading the file
   */
  private static loadZip(name: string, callback?: () => void) {

    let zip = new JSZip();

    let baseName = name.substring(name.indexOf('/') + 1, name.indexOf('.'));

    FileManager.getInstance().addBaseDir(baseName, name);

    // get request for zip file
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${ZipHandler.zipBase}/${name}`);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      let f = xhr.response;
      // load the zip file from the response
      zip.loadAsync(f).then(function(zip) {
        // calculate the number of objects to load
        ZipHandler.numToLoad = Object.keys(zip.files).length;
        ZipHandler.numLoaded = 0;

        zip.forEach(function (relativePath, zipEntry) {
          if (zipEntry.name.endsWith('.mp3')) {
            zipEntry.async('base64').then(function(data) {
              data = 'data:audio/mp3;base64,' + data;

              FileManager.getInstance().addFile(baseName, zipEntry.name, data, () => {
                ZipHandler.checkCallback(callback);
              });
            });
          } else {
            ZipHandler.checkCallback(callback);
          }
        });
      }, function (e) {
        console.log(e);
      });
    };
    xhr.send();
    console.log(`Fetching sound file \"${name}\" from the server...`);
  }

  // increment the num loaded and check if we ca callback
  private static checkCallback(callback?: () => void) {
    ZipHandler.numLoaded += 1;
    if (ZipHandler.numLoaded >= ZipHandler.numToLoad) {
      if (callback) {
        callback();
      }

      if (ZipHandler.queue.length > 0) {
        ZipHandler.popQueue();
      }
    }
  }
}
