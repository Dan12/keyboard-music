class MapToKeyboard {
  private mapTo: PayloadKeyboard;

  constructor() {
    let maptoPayloadFunc = (type: PayloadHookRequest, payload?: Payload, objData?: number): boolean => {
      return false;
    };

    let keyHook = (type: PayloadHookRequest, payload?: Payload, objData?: KeyboardKey): boolean => {
      if (type === PayloadHookRequest.RECEIVED) {
        if (payload instanceof SoundFile)
          this.addSound(objData.getRow(), objData.getCol(), payload);
        else if (payload instanceof KeyboardKey) {
          let sound = KeyPayloadManager.getInstance().getSoundFromKey(<KeyboardKey> payload);
          this.addSound(objData.getRow(), objData.getCol(), sound);
        }
        else
          collectErrorMessage('Payload type does not match soundfile type in keyboard', payload);
      } else if (type === PayloadHookRequest.CAN_RECEIVE) {

        return payload instanceof SoundFile || payload instanceof KeyboardKey;
      } else if (type === PayloadHookRequest.IS_PAYLOAD) {
        return true;
      }

      return false;
    };

    this.mapTo = new PayloadKeyboard(KeyBoardType.STANDARD, maptoPayloadFunc, keyHook);
    this.mapTo.getKeyboard().resize(0.6);
    this.mapTo.getKeyboard().centerVertical();
    // turn square green when there is a key on it
    this.mapTo.getKeyboard().getColorManager().setRoutine(
      (r: number, c: number, p: boolean) => {
        let hasElement = SongManager.getCurrentPack().getContainer(
          KeyboardUtils.gridToLinear(r, c, KeyboardUtils.getKeyboardSize(KeyBoardType.STANDARD).cols)
        ) !== undefined;

        return [{row: r, col: c, r: p ? 255 : hasElement ? 100 : -1, g: p ? 160 : hasElement ? 255 : -1, b: p ? 0 : hasElement ? 100 : -1}];
      }
    );
    this.mapTo.getKeyboard().setPressKeyListener((r: number, c: number) => {
      console.log(`inspect ${r},${c}`);
    });
  }

  private addSound(r: number, c: number, sound: SoundFile) {
    // add the sound to the song
    SongManager.getSong().addSound(
      0,
      KeyboardUtils.gridToLinear(r, c, KeyboardUtils.getKeyboardSize(KeyBoardType.STANDARD).cols),
      sound
    );

    this.mapTo.getKeyboard().getColorManager().releasedKey(r, c);
    this.mapTo.getKeyboard().getKey(r, c).setPreviousColor();
  }

  public getElement(): JQuery {
    return this.mapTo.asElement();
  }

  public getKeyboard(): Keyboard {
    return this.mapTo.getKeyboard();
  }
}