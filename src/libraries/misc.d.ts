// miscelaneous library declarations

interface Window {
    AudioContext?: any;
    webkitAudioContext?: any;
}

interface HTMLElement {
    getContext?: any;
    width?: any;
}

interface DOMException {
    err?: any;
}

interface DecodeErrorCallback {
    (e?: DOMException): void;
}
