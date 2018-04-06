// Type definitions for howler.js v1.1.29
// Project: https://github.com/goldfire/howler.js
// Definitions by: Pedro Casaubon <https://github.com/xperiments/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare class HowlerGlobal {
    mute(): HowlerGlobal;
    unmute(): HowlerGlobal;
    volume(): number;
    volume(volume: number): HowlerGlobal;
    codecs(extension: string): boolean;
    iOSAutoEnable: boolean;
}

declare var Howler: HowlerGlobal;

interface IHowlSoundSpriteDefinition {
    [name: string]: (number|boolean)[];
}

interface IHowlProperties {
    autoplay?: boolean;
    buffer?: boolean;
    format?: string;
    loop?: boolean;
    sprite?: IHowlSoundSpriteDefinition;
    volume?: number;
    src?: string[];
    onend?: Function;
    onload?: Function;
    onloaderror?: Function;
    onpause?: Function;
    onplay?: Function;
}

interface Howl {
    autoplay: Boolean;
    buffer: Boolean;
    format: string;
    rate: number;
    model: string;
    onend: Function;
    onload: Function;
    onloaderror: Function;
    onpause: Function;
    onplay: Function;
    load(): Howl;
    play(sprite?: string, callback?: (soundId: number) => void): number;
    play(callback?: (soundId: number) => void): Howl;
    pause(soundId?: number): Howl;
    stop(soundId?: number): Howl;
    mute(soundId?: number): Howl;
    unmute(soundId?: number): Howl;
    fade(from: number, to: number, duration: number, callback?: Function, soundId?: number): Howl;
    loop(): boolean;
    loop(loop: boolean): Howl;
    seek(position?: number, soundId?: number): number;
    pos3d(x: number, y: number, z: number, soundId?: number): any;
    sprite(definition?: IHowlSoundSpriteDefinition): IHowlSoundSpriteDefinition;
    volume(): number;
    volume(volume?: number, soundId?: number): Howl;
    urls(): string[];
    urls(urls: string[]): Howl;
    on(event: string, listener?: Function): Howl;
    off(event: string, listener?: Function): Howl;
    unload(): void;
    duration(soundId?: number): number;
    playing(soundId?: number): boolean;

    // technically a private var
    _src: string;
    _sprite: {[id: string]: [number, number, boolean]};
}

interface HowlStatic {
    new (properties: IHowlProperties): Howl;
}

declare let Howl: HowlStatic;

declare module "howler" {
    export let Howler: HowlerGlobal;
    export let Howl: HowlStatic;
}