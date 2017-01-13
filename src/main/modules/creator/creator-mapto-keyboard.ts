/**
 * handles the logic and hooks for the map to keyboard
 */
class MapToKeyboard {

  private mapTo: PayloadKeyboard;
  private container: JQW;

  constructor() {
    // TODO do correct processing of payload files

    // the hook for treating the keyboard as a payload receiver.
    // always returns false, so map to keyboard cannot receive payloads
    let maptoPayloadFunc = (type: PayloadHookRequest, payload?: Payload, objData?: number): boolean => {
      return false;
    };

    // the hook for the map to keyboard keys, process the input payload
    let keyHook = (type: PayloadHookRequest, payload?: Payload, objData?: KeyboardKey): boolean => {
      if (type === PayloadHookRequest.RECEIVED) {
        // process the payload and add the sound file represented by the payload to the current song
        if (payload instanceof Sound)
          this.addSound(objData.getRow(), objData.getCol(), payload);
        else if (payload instanceof KeyboardKey) {
          let container = KeyPayloadManager.getInstance().getSoundFromKey(<KeyboardKey> payload);
          this.setContainer(objData.getRow(), objData.getCol(), container);
        }
        else
          collectErrorMessage('Payload type does not match soundfile or keyboard key in map to', payload);
      } else if (type === PayloadHookRequest.CAN_RECEIVE) {
        return payload instanceof Sound || payload instanceof KeyboardKey;
      } else if (type === PayloadHookRequest.IS_PAYLOAD) {
        // key can only be used as a payload if it has a sound applied to it
        return this.getPayload(objData.getRow(), objData.getCol()) !== undefined;
      }

      return false;
    };

    this.mapTo = new PayloadKeyboard(KeyBoardType.STANDARD, maptoPayloadFunc, keyHook);
    this.mapTo.getKeyboard().resize(0.6);
    this.mapTo.centerVertical();

    // turn square green when there is a sound assigned to it on key up and mimic the usual keypress
    this.mapTo.getKeyboard().getColorManager().setRoutine(
      (r: number, c: number, p: boolean) => {
        let hasElement = this.getPayload(r, c) !== undefined;

        return [{row: r, col: c, r: p ? 255 : hasElement ? 100 : -1, g: p ? 160 : hasElement ? 255 : -1, b: p ? 0 : hasElement ? 100 : -1}];
      }
    );
    this.mapTo.getKeyboard().setPressKeyListener((key: KeyboardKey) => {
      let container = this.getPayload(key.getRow(), key.getCol());
      if (container)
        Toolbar.getInstance().inspectContainer(container);
    });

    this.container = new JQW('<div class="horizontal-column"></div>');
    this.container.append(this.mapTo.asElement());
  }

  /**
   * get the sound file from the key payload manager for a key on this keyboard at r,c
   */
  private getPayload(r: number, c: number): SoundContainer {
    return KeyPayloadManager.getInstance().getKey(
      this.mapTo.getKeyboard().getID(),
      KeyboardUtils.gridToLinear(r, c, this.mapTo.getKeyboard().getNumCols())
    );
  }

  /**
   * add the given sound to the song
   */
  private addSound(r: number, c: number, sound: Sound) {
    let location = KeyboardUtils.gridToLinear(r, c, KeyboardUtils.keyboardTypeToSize(KeyBoardType.STANDARD).cols);
    // add the sound to the song
    SongManager.getSong().addSound(0, location, sound);

    // add the container to the key payload manager if it doesn't exist
    if (KeyPayloadManager.getInstance().getKey(this.getKeyboard().getID(), location) === undefined) {
      let container = SongManager.getCurrentPack().getContainer(location);
      KeyPayloadManager.getInstance().addKey(this.getKeyboard().getID(), location, container);

      this.showSoundActive(r, c);
    }
  }

  private setContainer(r: number, c: number, container: SoundContainer) {
    let location = KeyboardUtils.gridToLinear(r, c, KeyboardUtils.keyboardTypeToSize(KeyBoardType.STANDARD).cols);
    SongManager.getCurrentPack().addContainer(container, location);

    // add the container to the key payload manager if it doesn't exist
    if (KeyPayloadManager.getInstance().getKey(this.getKeyboard().getID(), location) === undefined) {
      let container = SongManager.getCurrentPack().getContainer(location);
      KeyPayloadManager.getInstance().addKey(this.getKeyboard().getID(), location, container);

      this.showSoundActive(r, c);
    }
  }

  /**
   * set the color of the key at the given row and column to the active color
   * @param r the key row
   * @param c the key col
   */
  public showSoundActive(r: number, c: number) {
    this.mapTo.getKeyboard().getColorManager().releasedKey(r, c);
    // use to deal with the hover over edge case
    this.mapTo.getKeyboard().getKey(r, c).setPreviousColor();
  }

  /**
   * @return the map to keyboard element
   */
  public getElement(): JQW {
    return this.container;
  }

  public getKeyboard(): Keyboard {
    return this.mapTo.getKeyboard();
  }
}
