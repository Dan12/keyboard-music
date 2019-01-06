class KeyboardMidiIO extends AbstractIO<PadMessage, void> {

  private keyboard: Keyboard;

  private static DEFAULT_COLOR = "white";
  private static PRESSED_COLOR = "rgb(255, 160, 0)";

  public constructor(keyboard: Keyboard) {
    super();
    this.keyboard = keyboard;
  }

  public receiveMessage(msg: PadMessage) {
    if (Globals.playerConfig.getPadConfig(msg.pack, msg.row, msg.col) !== PadConfiguration.NoConfig) {
      if (msg.dirn === KeyDirection.DOWN) {
        this.keyboard.rows[msg.row][msg.col].setColor(KeyboardMidiIO.PRESSED_COLOR);
        this.keyboard.rows[msg.row][msg.col].ripple();
      } else {
        this.keyboard.rows[msg.row][msg.col].setColor(KeyboardMidiIO.DEFAULT_COLOR);
      }
    }

    this.keyboard.setPack(msg.pack);
  }
}