/// <reference path="./modules/mouse-payload.ts"/>
/// <reference path="./modules/keyboard/keyboard.ts"/>
/// <reference path="./modules/files/file-manager.ts"/>
/// <reference path="./modules/files/file-gui.ts"/>
/// <reference path="./modules/files/file-inspector.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
// /// <reference path="./modules/song/song.ts"/>
/// <reference path="./modules/mode-handler.ts"/>
/// <reference path="./modules/creator/creator.ts"/>

/// <reference path="./modules/newZip.ts"/>
// /// <reference path="./modules/zip-handler.ts"/>

/// <reference path="./modules/error-collector.ts"/>

/**
 * Loads certain modules onto the main element
 *
 * @method ModuleLoader
 * @for Main
 * @param main_element {JQuery} the jQuery element to load the modules onto
 */
function ModuleLoader(main_element: JQuery) {
  // add the keyboard
  main_element.append(Keyboard.getInstance().asElement());

  // add the creator
  main_element.append(Creator.getInstance().asElement());

  // add the file gui
  main_element.append(FileGUI.getInstance().asElement());

  // add the sound inspector
  main_element.append(FileInspector.getInstance().asElement());

  // initialize the mode handler
  ModeHandler.init();
  // ModeHandler.setMode(Mode.CREATOR);

  // initialize the mouse payload listener on the main element
  MousePayload.initialize(main_element);

  // initilize the event propegator
  InputEventPropegator.init();

  // let song = new Song('songs/equinox.json', () => {
  //   console.log(song);
  // });

  // intialize the file manager data object
  let manager = FileManager.getInstance();

  // load eq.zip into the file manager
  NewZip.loadZip('eq.zip');

  // ZipHandler.initialize();
  // ZipHandler.loadZip('eq.zip', function() {
  //   console.log('loaded');
  // });
};
