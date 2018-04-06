/**
 * the container class for the note editor
 */
class NoteEditor extends DomElement {

  private noteRows: JQW[];

  private scrollArea: JQW;
  private sidePanel: JQW;
  private scrubBar: JQW;
  private controlPanel: JQW;

  constructor() {
    super(new JQW('<div class="note-editor"></div>'));

    this.controlPanel = new JQW('<div class="control-panel"></div>');
    this.asElement().append(this.controlPanel);

    this.scrollArea = new JQW('<div class="scroll-area"></div>');
    this.asElement().append(this.scrollArea);
    
    this.sidePanel = new JQW('<div class="side-panel"></div>');
    this.scrollArea.append(this.sidePanel);

    this.scrubBar = new JQW('<div class="scrub-bar"></div>');
    this.scrollArea.append(this.scrubBar);

    this.noteRows = [];

    for(let row of KeyboardUtils.keyboardSymbols) {
      for(let key of row) {
        this.sidePanel.append('<div class="key-cell">' + key + '</div>');

        let noteRow = new JQW('<div class="note-row"></div>');
        this.noteRows.push(noteRow);
        this.scrollArea.append(noteRow);
      }
    }

    Resizer.resize(() => {
      this.resize();
    });

    this.asElement().scroll(() => {
      this.sidePanel.css('left', '0px');
    });
  }

  public resize() {
    console.log(this.asElement().height());
    console.log(this.controlPanel.height());
    this.scrollArea.css('height', (this.asElement().height() - this.controlPanel.height()) + 'px');
  }
}