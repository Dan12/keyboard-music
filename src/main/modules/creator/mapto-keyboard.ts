/// <reference path="./ripple.ts"/>

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
        if (payload instanceof Sound) {
          PayloadAlias.getInstance().addSongKey(objData, payload);
          this.showSoundActive(objData);

          Toolbar.getInstance().inspectContainer(objData);
        } else if (payload instanceof KeyboardKey) {
          let sound = PayloadAlias.getInstance().getSquareKey(payload);
          if (sound) {
            PayloadAlias.getInstance().addSongKey(objData, sound);
          } else {
            let container = PayloadAlias.getInstance().getSongKey(payload);
            PayloadAlias.getInstance().setSongContainer(objData, container);
          }
          this.showSoundActive(objData);

          Toolbar.getInstance().inspectContainer(objData);
        }
        else
          collectErrorMessage('Payload type does not match soundfile or keyboard key in map to', payload);
      } else if (type === PayloadHookRequest.CAN_RECEIVE) {
        return payload instanceof Sound || payload instanceof KeyboardKey;
      } else if (type === PayloadHookRequest.IS_PAYLOAD) {
        // key can only be used as a payload if it has a sound applied to it
        return PayloadAlias.getInstance().getSongKey(objData) !== undefined;
      }

      return false;
    };

    this.mapTo = new PayloadKeyboard(KeyBoardType.STANDARD, maptoPayloadFunc, keyHook);
    this.mapTo.getKeyboard().resize(0.6);
    this.mapTo.centerVertical();

    PayloadAlias.getInstance().registerSongId(this.mapTo.getKeyboard().getID());

    // turn square green when there is a sound assigned to it on key up and mimic the usual keypress
    this.mapTo.getKeyboard().getColorManager().setRoutine(
      (r: number, c: number, p: boolean) => {
        if (!p)
          rippleElement(this.mapTo.getKeyboard().getKey(r, c).asElement());

        return [{row: r, col: c, r: p ? 255 : -1, g: p ? 160 : -1, b: p ? 0 : -1}];
      }
    );
    this.mapTo.getKeyboard().setPressKeyListener((key: KeyboardKey) => {
      let container = PayloadAlias.getInstance().getSongKey(key);
      if (container)
        Toolbar.getInstance().inspectContainer(key);
    });

    this.container = new JQW('<div class="horizontal-column"></div>');
    this.container.append(this.mapTo.asElement());
  }

  /**
   * set the color of the key at the given row and column to the active color
   * @param r the key row
   * @param c the key col
   */
  public showSoundActive(key: KeyboardKey) {
    key.setDefaultColor(100, 255, 100);
    // use to deal with the hover over edge case
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