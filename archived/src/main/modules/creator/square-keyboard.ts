/**
 * handles the logic and hooks for the square reference keyboard
 */
class SquareKeyboard {

  private square: PayloadKeyboard;
  private element: JQW;

  constructor() {
    // TODO do correct processing of payload files

    // the hook for the keyboard, process the directory payload and update multiple files
    let squarePayloadFunc = (type: PayloadHookRequest, payload?: Payload, objData?: number): boolean => {
      if (type === PayloadHookRequest.RECEIVED) {
        this.processPayload(payload);
      } else if (type === PayloadHookRequest.CAN_RECEIVE) {
        return payload instanceof Directory;
      } else if (type === PayloadHookRequest.IS_PAYLOAD) {
        return true;
      }

      return false;
    };

    // the hook for the keyboard keys, receives a sound file
    let keyHook = (type: PayloadHookRequest, payload?: Payload, objData?: KeyboardKey): boolean => {
      if (type === PayloadHookRequest.RECEIVED) {
        if (payload instanceof Sound) {
          PayloadAlias.getInstance().addSquareKey(objData, payload);
          this.activateKey(objData);

          objData.asElement().click();
        }
        else if (payload instanceof KeyboardKey) {
          let sound = PayloadAlias.getInstance().getSquareKey(payload);
          PayloadAlias.getInstance().addSquareKey(objData, sound);
          this.activateKey(objData);

          objData.asElement().click();
        } else
          collectErrorMessage('Payload type does not match soundfile type in keyboard', payload);
      } else if (type === PayloadHookRequest.CAN_RECEIVE) {
        // can only recieve from this
        return payload instanceof Sound || (
          payload instanceof KeyboardKey &&
          payload !== objData &&
          payload.getKeyboard().getID() === this.getKeyboard().getID()
        );
      } else if (type === PayloadHookRequest.IS_PAYLOAD) {
        return PayloadAlias.getInstance().getSquareKey(objData) !== undefined;
      }

      return false;
    };

    this.square = new PayloadKeyboard(KeyBoardType.SQUARE, squarePayloadFunc, keyHook);
    this.getKeyboard().resize(0.6);
    this.square.centerVertical();
    this.getKeyboard().setShowKeys(false);
    // add some spacing to the square
    this.square.asElement().css({'margin-right': '30px'});
    this.getKeyboard().setClickKeyListener((key: KeyboardKey) => {
      let sound = PayloadAlias.getInstance().getSquareKey(key);
      if (sound) {
        Toolbar.getInstance().inspectSound(sound, key, true);
      }
    });

    PayloadAlias.getInstance().registerSquareKeyboard(this.getKeyboard().getID());

    this.element = new JQW('<div class="horizontal-column"></div>');
    this.element.append(this.square.asElement());
  }

  /**
   * called when a directory payload is recieved
   */
  private processPayload(payload: Payload) {
    PayloadAlias.getInstance().clear();
    this.resetGUI();

    if (payload instanceof Directory) {
      // find the lowest directory with a file, stop if no subdirectory
      let lowestDir = <Directory> payload;
      while (lowestDir.numFiles() === 0 && lowestDir.numDirs() > 0) {
        lowestDir = lowestDir.getFirstDir();
      }

      let sounds = lowestDir.getFiles();
      for (let sound of sounds) {
        // place sounds based on the grid convention a-d, 0-15
        let sLetter = sound.toLowerCase().charCodeAt(0) - 97;
        let sNum = parseInt(sound.substring(1, sound.length));
        if (sLetter >= 0 && sLetter <= 3 && sNum >= 0 && sNum <= 15) {
          let r = Math.floor(sLetter / 2) * 4 + Math.floor(sNum / 4);
          let c = (sLetter % 2) * 4 + (sNum % 4);

          // get the sound file based on the name
          let soundFile = lowestDir.getFile(sound);

          let key = this.getKeyboard().getKey(r, c);

          // add the key to the payload alias
          PayloadAlias.getInstance().addSquareKey(key, soundFile);

          // activate the key so that the gui reflects the Payload Alias
          this.activateKey(key);
        }
      }
    } else {
      collectErrorMessage('Payload is not directory in keyboard');
    }
  }

  public getKeyboard(): Keyboard {
    return this.square.getKeyboard();
  }

  public getElement(): JQW {
    return this.element;
  }

  /** reset this keyboard gui */
  public resetGUI() {
    this.getKeyboard().resetKeys();
  }

  /** set the key's background color to indicate it has a sound assigned to it */
  private activateKey(key: KeyboardKey) {
    key.setDefaultColor(100, 255, 100);
  }
}
