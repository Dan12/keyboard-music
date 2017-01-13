class ContainerTools extends DomElement {

  private pitchContainer: JQW;

  constructor() {
    super(new JQW('<div id="container-tools" class="horizontal-column"></div>'));

    this.pitchContainer = new JQW('<div id="pitch-container"></div>');

    
  }

  public inspectContainer(soundContainer: SoundContainer) {
    console.log('inspect container');
    console.log(soundContainer);
  }
}
