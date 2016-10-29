/// <reference path="./modules/mouse-payload.ts"/>
/// <reference path="./modules/keyboard.ts"/>
/// <reference path="./modules/file-manager.ts"/>
/// <reference path="./modules/sound-loader.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
/// <reference path="./modules/song-loader.ts"/>

/**
 * Loads certain modules onto the main element
 *
 * @method ModuleLoader
 * @for Main
 * @param main_element {JQuery} the jQuery element to load the modules onto
 */
function ModuleLoader(main_element: JQuery) {
  let keyboard = new Keyboard();

  console.log('loading keyboard');

  main_element.append(keyboard.asElement());

  MousePayload.initialize(main_element);

  let propegator = new InputEventPropegator(keyboard);

  let fileManager = new FileManager();

  let eqSong = new Song();

  loadSong('songs/equinox.json', eqSong, fileManager);
};
