/// <reference path="./keyboardMessage.ts"/>

class KeyboardIO extends AbstractIO<void, KeyboardMessage> {

  public static instance: KeyboardIO = new KeyboardIO();

  private constructor() {
    super();
    document.onkeydown = (event) => {
      this.sendMessage(new KeyboardMessage(event.keyCode, KeyDirection.DOWN, event));
    };

    document.onkeyup = (event) => {
      this.sendMessage(new KeyboardMessage(event.keyCode, KeyDirection.UP, event));
    };
  }

}