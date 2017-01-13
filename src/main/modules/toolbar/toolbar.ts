/// <reference path="./container-tools.ts"/>
/// <reference path="./song-tools.ts"/>
/// <reference path="./sound-tools.ts"/>

/**
 * A gui class for inspecting a sound file
 */
class Toolbar extends DomElement {

  private static instance: Toolbar;

  private songTools: SongTools;
  private soundTools: SoundTools;
  private containerTools: ContainerTools;

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): Toolbar {
    if (Toolbar.instance === undefined) {
      Toolbar.instance = new Toolbar();
    }

    return Toolbar.instance;
  }

  private constructor() {
    super(new JQW('<div id="toolbar"></div>'));

    this.songTools = new SongTools();
    this.asElement().append(this.songTools.asElement());

    this.containerTools = new ContainerTools();
    this.asElement().append(this.containerTools.asElement());

    this.soundTools = new SoundTools();
    this.asElement().append(this.soundTools.asElement());
  }

  public getSoundTools(): SoundTools {
    return this.soundTools;
  }

  public getContainerTools(): ContainerTools {
    return this.containerTools;
  }
}
