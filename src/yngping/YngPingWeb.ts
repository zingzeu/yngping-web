import {CandidateWindow} from '../ui';
import { INITIALISED, ERROR, CALLBACK, KEYPRESS } from '../common/messageTypes';
import { IInputManager } from '../ui/iInputManager';
import { CandidateWindowStateBuilder, Composition, Candidate } from '../ui/candidateWindowState';


const webworkerSrc : string = 'worker.js';
const regexcomp = /{?[a-z,\,,_]*}?(.+)?=>(.*)/;

export class YngPingWeb {
    
    private candiadateWindow = new CandidateWindow();
    private worker : Worker;
    private ready: boolean = false;
    private capturingKeys: boolean = false;

    constructor() {

    }

    public async init(): Promise<void> {
        try {
            await this.initWebWorker();
        } catch (e) {
            console.log("Failed to init", e);
            return;
        }
        
        this.ready = true;
        console.log("ready");
        this.worker.onmessage = this.onWorkerMessage;
        this.initKeys();
        (this.candiadateWindow as IInputManager).registerInputFocusedListener(
            ()=> {
                this.capturingKeys = true;
            }
        );
        (this.candiadateWindow as IInputManager).registerInputBlurredListener(
            ()=> {
                this.capturingKeys = false;
            }
        );
        this.candiadateWindow.activate();

    }

    private initWebWorker() {
        return new Promise((resolve, reject) => {
            this.worker = new Worker(webworkerSrc);
            const stateChangeListener = (message) => {
                const data = message.data;
                this.statusUpdate(data);
                if (data.type == INITIALISED) {
                    this.worker.removeEventListener("message", stateChangeListener);                    
                    resolve();
                } else if (data.type == ERROR) {
                    this.worker.removeEventListener("message", stateChangeListener);
                    reject();
                }
            }
            this.worker.onmessage = stateChangeListener;
        });
    }

    private statusUpdate(data) {
        console.log("Status:", data);
    }

    /**
     * Sends key (sequence) to librime.
     */
    private keyin = (key: string) => {
        if (this.ready && this.capturingKeys) {
            this.worker.postMessage({
                type: KEYPRESS,
                key
            });
        }
    }

    private initKeys() {
        const listener = new (window as any).keypress.Listener();
        listener.simple_combo("ctrl `", () => this.keyin("{Control+grave}"));
        listener.simple_combo("space", () => this.keyin(" "))
        listener.simple_combo("backspace", () => this.keyin("{BackSpace}"));
        listener.simple_combo("enter", () => this.keyin("{Return}"));
        listener.register_many([
            {
                "keys": "up",
                "on_keydown": () => this.keyin("{Up}"),
                "prevent_default": true
            },
            {
                "keys": "down",
                "on_keydown": () => this.keyin("{Down}"),
                "prevent_default": true
            },
        ]);
        const letters = [];
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
            'u', 'v', 'w', 'x', 'y', 'z'].forEach((x) => {
                letters.push({
                    "keys": x,
                    "on_keydown": () => this.keyin(x)
                });
            })
        listener.register_many(letters);
    }

    private onWorkerMessage = (message: MessageEvent) => {
        const data = message.data;
        if (data.type == CALLBACK) {
            // process and render
            if (this.capturingKeys) {
                const { payload } = data;
                if (payload.type == "commit") {
                    this.candiadateWindow.commitText(payload.text);
                    this.candiadateWindow.hide();
                } else if (payload.type == "composing") {
                    const pageNo = payload.page_no;
                    let highlightIndex = payload.index;
                    const candidates : Array<string> = (payload.cand as Array<any>).map(item => item.text);
                    highlightIndex %= candidates.length;
                    let builder = new CandidateWindowStateBuilder()
                        .setComposition(new Composition(payload.input, 0));
                    for (let i = 0; i < candidates.length; ++i) {
                        builder.addCandidate(new Candidate(candidates[i], ""));
                    }
                    builder.setHighLighted(highlightIndex);
                    this.candiadateWindow.render(builder.build());
                }
            }
        }
    }

}