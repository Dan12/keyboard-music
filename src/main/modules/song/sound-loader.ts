/**
 * load all of the sounds from the given list of urls. Call the callback when done loading the sounds
 */
function loadSounds(urls: string[], callback: () => void) {
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
