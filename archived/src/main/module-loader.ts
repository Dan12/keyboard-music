/// <reference path="./modules/element.ts"/>
/// <reference path="./modules/payload/mouse-payload.ts"/>
/// <reference path="./modules/modes/keyboard-layout.ts"/>
/// <reference path="./modules/files/file-manager.ts"/>
/// <reference path="./modules/files/file-gui.ts"/>
/// <reference path="./modules/toolbar/toolbar.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
/// <reference path="./modules/song/song-manager.ts"/>
/// <reference path="./modules/modes/mode-handler.ts"/>
/// <reference path="./modules/modes/creator.ts"/>
/// <reference path="./modules/zip.ts"/>
/// <reference path="./modules/error-collector.ts"/>
/// <reference path="./modules/jquery_wrapper/jquery-wrapper.ts"/>
/// <reference path="./modules/modes/splitter.ts"/>
/// <reference path="./modules/events/dom-events.ts"/>
/// <reference path="./modules/payload/highlightable.ts"/>
/// <reference path="./modules/audio/audio-tools.ts"/>
/// <reference path="./modules/song/sound-utils.ts"/>
/// <reference path="./modules/editor/editor.ts"/>
/// <reference path="./modules/resizer.ts"/>

/**
 * Loads certain modules onto the main element
 * @param main_element the jQuery element to load the modules onto
 */
function ModuleLoader(main_element: JQW) {
  // add the keyboard
  main_element.append(KeyboardLayout.getInstance().asElement());

  // add the creator
  main_element.append(Creator.getInstance().asElement());

  // add the creator
  main_element.append(Splitter.getInstance().asElement());

  // add the editor
  main_element.append(Editor.getInstance().asElement());

  // initialize the mode handler
  ModeHandler.init();
  ModeHandler.setMode(Mode.KEYBOARD);

  // initialize the mouse payload listener on the main element
  MousePayload.initialize(main_element);

  // initilize the event propegator
  InputEventPropegator.init();

  // intialize the file manager data object
  let manager = FileManager.getInstance();

  // call resize after all elements have been added
  window.dispatchEvent(new Event('resize'));
};
