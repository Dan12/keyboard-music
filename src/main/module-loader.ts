/// <reference path="./modules/payload/mouse-payload.ts"/>
/// <reference path="./modules/keyboard/keyboard-layout.ts"/>
/// <reference path="./modules/files/file-manager.ts"/>
/// <reference path="./modules/files/file-gui.ts"/>
/// <reference path="./modules/toolbar.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
/// <reference path="./modules/song/song-manager.ts"/>
/// <reference path="./modules/mode-handler.ts"/>
/// <reference path="./modules/creator/creator-layout.ts"/>
/// <reference path="./modules/zip.ts"/>
/// <reference path="./modules/error-collector.ts"/>
/// <reference path="./modules/jquery_wrapper/jquery-wrapper.ts"/>

/**
 * Loads certain modules onto the main element
 * @param main_element the jQuery element to load the modules onto
 */
function ModuleLoader(main_element: JQW) {
  // add the keyboard
  main_element.append(KeyboardLayout.getInstance().asElement());

  // add the creator
  main_element.append(Creator.getInstance().asElement());

  // initialize the mode handler
  ModeHandler.init();
  ModeHandler.setMode(Mode.CREATOR);

  // initialize the mouse payload listener on the main element
  MousePayload.initialize(main_element);

  // initilize the event propegator
  InputEventPropegator.init();

  // intialize the file manager data object
  let manager = FileManager.getInstance();

  // load eq.zip into the file manager
  ZipHandler.loadZip('eq.zip', () => {
    console.log('loaded eq.zip');
  });
};
