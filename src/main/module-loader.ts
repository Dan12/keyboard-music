/// <reference path="./modules/mouse-payload.ts"/>
/// <reference path="./modules/keyboard/keyboard.ts"/>
/// <reference path="./modules/files/file-manager.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
/// <reference path="./modules/song/song.ts"/>
/// <reference path="./modules/mode-handler.ts"/>
/// <reference path="./modules/creator/creator.ts"/>

/// <reference path="./modules/newZip.ts"/>

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

  let creator = new Creator();

  main_element.append(creator.asElement());

  ModeHandler.init(keyboard, creator);

  MousePayload.initialize(main_element);

  InputEventPropegator.init();

  let song = new Song('songs/equinox.json', () => {
    console.log(song);
  });

  ModeHandler.setMode(Mode.CREATOR);

  NewZip.loadZip('eq.zip');
};
