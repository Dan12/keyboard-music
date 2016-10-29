/// <reference path="./modules/mouse-payload.ts"/>
/// <reference path="./modules/keyboard.ts"/>
/// <reference path="./modules/file-manager.ts"/>
/// <reference path="./modules/sound-loader.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
/// <reference path="./modules/song.ts"/>
/// <reference path="./modules/mode-handler.ts"/>
/// <reference path="./modules/creator.ts"/>

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

  InputEventPropegator.init();

  let fileManager = new FileManager();

  let song = new Song('songs/equinox.json', fileManager, () => {
    console.log(song);
  });
};
