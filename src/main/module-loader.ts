import { Keyboard } from './modules/keyboard';
import { MousePayload } from './modules/mouse-payload';
import { FileManager } from './modules/file-manager';
import { loadSounds } from './modules/sound-loader';

/**
 * Loads certain modules onto the main element
 *
 * @method ModuleLoader
 * @for Main
 * @param main_element {JQuery} the jQuery element to load the modules onto
 */
export function ModuleLoader(main_element: JQuery) {
  let keyboard = new Keyboard();

  console.log('loading keyboard');

  main_element.append(keyboard.asElement());

  MousePayload.initialize(main_element);

  let fileManager = new FileManager();

  loadSounds(['eq'], fileManager);
};
