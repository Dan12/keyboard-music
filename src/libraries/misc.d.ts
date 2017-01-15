// miscelaneous library declarations

interface Window {
    AudioContext?: any;
    webkitAudioContext?: any;
}

interface HTMLElement {
    getContext?: any;
    width?: any;
    height?: any;
    value?: any;
}

interface DOMException {
    err?: any;
}

interface DecodeErrorCallback {
    (e?: DOMException): void;
}
