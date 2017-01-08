class SquareKeyboard {

  private square: PayloadKeyboard;

  constructor() {
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

    let keyHook = (type: PayloadHookRequest, payload?: Payload, objData?: KeyboardKey): boolean => {
      if (type === PayloadHookRequest.RECEIVED) {
        if (payload instanceof SoundFile)
          this.addSquareSound(objData.getRow(), objData.getCol(), payload);
        else if (payload instanceof KeyboardKey) {
          let sound = KeyPayloadManager.getInstance().getSoundFromKey(<KeyboardKey> payload);
          this.addSquareSound(objData.getRow(), objData.getCol(), sound);
        } else
          collectErrorMessage('Payload type does not match soundfile type in keyboard', payload);
      } else if (type === PayloadHookRequest.CAN_RECEIVE) {
        return payload instanceof SoundFile || payload instanceof KeyboardKey;
      } else if (type === PayloadHookRequest.IS_PAYLOAD) {
        return this.getPayload(objData.getRow(), objData.getCol()) !== undefined;
      }

      return false;
    };

    this.square = new PayloadKeyboard(KeyBoardType.SQUARE, squarePayloadFunc, keyHook);
    this.square.getKeyboard().resize(0.6);
    this.square.getKeyboard().centerVertical();
    // add some spacing to the square
    this.square.asElement().css({'margin-right': '30px'});
    // turn square green when active
    this.square.getKeyboard().getColorManager().setRoutine(ColorManager.standardColorRoutine(100, 255, 100));
    this.square.getKeyboard().setPressKeyListener((r: number, c: number) => {
      let sound = this.getPayload(r, c);
      if (sound)
        Toolbar.getInstance().inspectSound(sound);
    });
  }

  public getElement(): JQuery {
    return this.square.asElement();
  }

  private getPayload(r: number, c: number): SoundFile {
    return KeyPayloadManager.getInstance().getKey(
      this.square.getKeyboard().getID(),
      KeyboardUtils.gridToLinear(r, c, this.square.getKeyboard().getNumCols())
    );
  }

  // called when a directory payload is recieved
  private processPayload(payload: Payload) {
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

          let soundFile = lowestDir.getFile(sound);

          this.addSquareSound(r, c, soundFile);

          // this.keyboard.getKey(r, c).setPayload(soundFile);
        }
      }
    } else {
      collectErrorMessage('Payload is not directory in keyboard');
    }
  }

  private addSquareSound(r: number, c: number, sound: SoundFile) {
    // Set the color
    this.square.getKeyboard().getColorManager().pressedKey(r, c);
    this.square.getKeyboard().getKey(r, c).setPreviousColor();

    // add the soundfile to the keyboard pool
    KeyPayloadManager.getInstance().addKey(
      this.square.getKeyboard().getID(),
      KeyboardUtils.gridToLinear(r, c, this.square.getKeyboard().getNumCols()), sound
    );
  }
}
