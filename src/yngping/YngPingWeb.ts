import { CandidateWindow, Toolbar } from '../ui';
import { INITIALISED, ERROR, CALLBACK, KEYPRESS, INITIALISING, LOADING_LONG } from '../common/messageTypes';
import { IInputManager } from '../ui/iInputManager';
import { CandidateWindowStateBuilder, Composition, Candidate } from '../ui/candidateWindowState';
import { ToolbarState, ToolbarStateBuilder } from '../ui/toolbarState';


const webworkerSrc : string = 'worker.js';
const regexcomp = /{?[a-z,\,,_]*}?(.+)?=>(.*)/;

export class YngPingWeb {
    
    private candiadateWindow = new CandidateWindow();
    private toolbar : Toolbar = new Toolbar();
    private worker : Worker;
    private ready: boolean = false;
    private capturingKeys: boolean = false;
    private composing: boolean = false;
    private lastInput: string = "";

    private readonly toolbarStateDownloading : ToolbarState =
        new ToolbarStateBuilder().addLoadingWidget().addTextWidget('词库下载中...').build();

    private readonly toolbarStateDownloadingLong : ToolbarState =
        new ToolbarStateBuilder().addLoadingWidget().addTextWidget('还在下载中...').build();

    private readonly toolbarStateInit : ToolbarState =
        new ToolbarStateBuilder().addInitWidget().addTextWidget('初始化 rime 引擎...').build();

    private readonly toolbarReady : ToolbarState =
        new ToolbarStateBuilder().addTextWidget('榕拼输入法').build();

    private readonly toolbarError : ToolbarState =
        new ToolbarStateBuilder().addTextWidget('初始化失败').build();

    /**
     * Keypress.js listener.
     */
    private listener: any = new (window as any).keypress.Listener();
    constructor() {
        this.toolbar.init();
    }

    public async init(): Promise<void> {
        this.toolbar.show();
        // init indicator
        this.toolbar.render(this.toolbarStateDownloading);
        try {
            await this.initWebWorker();
        } catch (e) {
            console.log("Failed to init", e);
            this.toolbar.render(this.toolbarError);
            return;
        }
        
        this.ready = true;
        console.log("ready");
    
        if (document.activeElement) (document.activeElement as HTMLElement).blur();
        this.toolbar.render(this.toolbarReady);
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
        if (data.type == INITIALISING) {
            this.toolbar.render(this.toolbarStateInit);
        } else if (data.type == LOADING_LONG) {
            this.toolbar.render(this.toolbarStateDownloadingLong);
        }
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
            if (this.lastInput.length == 1 && key == "{BackSpace}") {
                this.stopComposing();
                this.candiadateWindow.hide();
            }
        }
    }

    private initSpecialKeys() {
        const listener = this.listener;
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
            },//@todo: next/prev pages
            /*,
            {
                "keys": "left",
                "on_keydown": () => this.keyin("{Left}"),
                "prevent_default": true
            },
            {
                "keys": "right",
                "on_keydown": () => this.keyin("{Right}"),
                "prevent_default": true
            }*/
        ]);
    }

    private uninitSpecialKeys() {
        const listener = this.listener;
        listener.unregister_combo("space", () => this.keyin(" "))
        listener.unregister_combo("backspace", () => this.keyin("{BackSpace}"));
        listener.unregister_combo("enter", () => this.keyin("{Return}"));
        listener.unregister_many(["up", "down"]/*,
            {
                "keys": "left",
                "on_keydown": () => this.keyin("{Left}"),
                "prevent_default": true
            },
            {
                "keys": "right",
                "on_keydown": () => this.keyin("{Right}"),
                "prevent_default": true
            }*/
        );
    }

    private initKeys() {
        const listener = this.listener;
        listener.simple_combo("ctrl `", () => this.keyin("{Control+grave}"));
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
        //listener.initSpecialKeys();
    }

    private startComposing() {
        if (this.composing == false) {
            this.composing = true;
            this.initSpecialKeys();
        }
    }

    private stopComposing() {
        if (this.composing == true) {
            this.composing = false;
            this.candiadateWindow.clear();
            this.uninitSpecialKeys();
        }
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
                    this.stopComposing();
                } else if (payload.type == "composing") {
                    const pageNo = payload.page_no;
                    this.lastInput = payload.input;
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
                    this.startComposing();
                }
            }
        }
    }

}