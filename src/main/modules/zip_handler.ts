/// <reference path="./file-manager.ts"/>

class ZipHandler {

  private static destination: FileManager;
  private static initializedScripts = false;
  private static zipBase = 'zip_files';

  public static initialize(destination: FileManager) {
    if (!ZipHandler.initializedScripts) {
      zip.workerScripts = {
        // TODO add as base64, don't load
        inflater: ['zip_files/z-worker.js', 'zip_files/inflate.js']
      };
      ZipHandler.initializedScripts = true;
    }

    ZipHandler.destination = destination;
  }

  // recursively iterate over the entries
  private static interateEntries(entries: zip.Entry[], i: number, reader: zip.ZipReader, callback: () => void) {
    if (i < entries.length) {
      // skip this entry if it is a directory
      if (entries[i].directory)
        ZipHandler.interateEntries(entries, i + 1, reader, callback);
      // only accept a file with the extension .mp3
      else if (entries[i].filename.endsWith('.mp3')) {
        entries[i].getData(new zip.Data64URIWriter('audio/mp3'), function(data: string) {
          ZipHandler.destination.addFile(entries[i].filename, data);
          ZipHandler.interateEntries(entries, i + 1, reader, callback);
        });
      // skip
      } else {
        ZipHandler.interateEntries(entries, i + 1, reader, callback);
      }
    } else {  // at the end, so close reader
      reader.close(function() {
        callback();
      });
    }
  }

  public static loadZip(name: string, callback: () => void) {
    // get request for zip file
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${ZipHandler.zipBase}/${name}.zip`);
    xhr.responseType = 'blob';
    xhr.onload = function(){
        // console.log(xhr.response)
        // create the zip reader for the zip file blob
        zip.createReader(new zip.BlobReader(xhr.response), function(reader: zip.ZipReader) {
          console.log('Extracting sounds from the file...');
          // get all entries from the zip
          reader.getEntries(function(entries: zip.Entry[]) {
            ZipHandler.interateEntries(entries, 0, reader, callback);
          });
        }, function(error: any) {
          console.log(error);
          console.log('There was a critical error. Please check back later.');
        });
    };
    xhr.send();
    console.log(`Fetching sound file \"${name}\" from the server...`);
  }
}
