/**
 * The new way to load a zip file.
 * TODO check browser compatibility, probably fails on IE
 * @class NewZip
 */
class NewZip {
  private static zipBase = 'songs';

  private static numToLoad = 0;
  private static numLoaded = 0;

  /**
   * load the contents of the zip file at the given location into the file manager.
   * Only loads .mp3 files and the location has to be a valid zip file
   * @method loadZip
   * @param {String} name the file name/location
   * @param {Callback} [callback] optional callback
   */
  public static loadZip(name: string, callback?: () => void) {

    let zip = new JSZip();

    let baseName = name.substring(name.indexOf('/') + 1, name.indexOf('.'));

    FileManager.getInstance().addBaseDir(baseName, name);

    // get request for zip file
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${NewZip.zipBase}/${name}`);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      let f = xhr.response;
      // load the zip file from the response
      zip.loadAsync(f).then(function(zip) {
        // calculate the number of objects to load
        NewZip.numToLoad = Object.keys(zip.files).length;

        zip.forEach(function (relativePath, zipEntry) {
          if (zipEntry.name.endsWith('.mp3')) {
            zipEntry.async('base64').then(function(data) {
              data = 'data:audio/mp3;base64,' + data;

              FileManager.getInstance().addFile(baseName, zipEntry.name, data);

              NewZip.checkCallback(callback);
            });
          } else {
            NewZip.checkCallback(callback);
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
    NewZip.numLoaded += 1;
    if (NewZip.numLoaded >= NewZip.numToLoad) {
      if (callback) {
        callback();
      }
    }
  }
}
