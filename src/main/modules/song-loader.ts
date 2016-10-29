/// <reference path="./song.ts"/>

/**
 * Load the given sound file from the location
 */
function loadSong(location: string, destination: Song, fileManager: FileManager) {
  // TODO: create sound containers from the file and store them in the song.
  // In the song, have a method to load all containers into a given keyboard.
  // Wire up the keyboard and keyboard keys to play the sounds.

  $.getJSON(location, function(data) {
    loadSounds(data.files, fileManager, () => {
      console.log(fileManager);
    });
  });
}
