//declare var postMessage : any;
declare var importScripts : any;
import {CALLBACK, LOADED, INITIALISED, ERROR, INITIALISING, LOADING, KEYPRESS} from '../common/messageTypes';

declare var Module : any;
const enc = new (TextEncoder as any)('UTF-8');
const regexcomp = /{?[a-z,\,,_]*}?(.+)?=>(.*)/;

let window :any = {};

window.rime_callback = (something) => {
    console.log("callback", something);
    (postMessage as any)({
        type: CALLBACK,
        payload: JSON.parse(something)
    });
}
try {
    (postMessage as any)({
        type: LOADING
    });
    importScripts("rime_console.js");
    (postMessage as any)({
        type: LOADED
    });
    setTimeout(() => {
        (postMessage as any)({
            type: INITIALISING
        });
        try {
            Module.init();
        } catch {
            // ignore error
        }
        (postMessage as any)({
            type: INITIALISED
        });
    },4000)

} catch {
    (postMessage as any)({
        type: ERROR,
        error: "failed to intialise librime."
    });
}

onmessage = (message) => {
    const data = message.data;
    
    if (data.type == KEYPRESS) {
        const { key } = data;
        Module.input(enc.encode(key));
    }
}