import { getCaretCoordinates } from './caretPosition';
import { CandidateWindowState, Composition, Candidate, CandidateWindowStateBuilder } from './candidateWindowState';
import { IInputManager, InputFocusedEventListener} from './iInputManager';

export class CandidateWindow implements IInputManager {

    private focusedListeners : Array<InputFocusedEventListener> = [];
    private blurredListeners : Array<InputFocusedEventListener> = [];

    public registerInputFocusedListener(listener: InputFocusedEventListener) {
        this.focusedListeners.push(listener);
    }
    public registerInputBlurredListener(listener: InputFocusedEventListener) {
        this.blurredListeners.push(listener);
    }

    public commitText(text: string): boolean {
        if (this.capturingKeys) {
            const input = this.activeInputElement as HTMLInputElement;
            if (input.selectionStart >= 0) {
                var startPos = input.selectionStart;
                var endPos = input.selectionEnd;
                input.value = input.value.substring(0, startPos)
                    + text
                    + input.value.substring(endPos, input.value.length);
                input.selectionStart = startPos + text.length; 
                input.selectionEnd = startPos + text.length; 
            } else {
                input.value += text;
            }
            this.clear();
            return true;
        } else {
            return false;
        }
    }

    private element: HTMLDivElement;
    private isActivated : boolean = false;
    private capturingKeys : boolean = false;
    private activeInputElement : HTMLElement = null;

    constructor () {
        this.element = document.createElement("div");
        this.element.style.cssText = `
            position: absolute;
            border: 1px solid #efefef;
            min-width:100px; 
            z-index:1000; 
            min-height: 20px;
            background: #f9f9f9;
            font-size: 16px;
            box-shadow: 0px 3px 9px 3px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
            padding: 5px;
            white-space: nowrap;`;
        this.hide();
    }

    public activate() {
        if (!this.isActivated) {
            window.document.body.appendChild(this.element);
            document.addEventListener("focus", this.onFocusEvent, true);
            document.addEventListener("blur", this.onBlurEvent, true);
            this.isActivated = true;
        }
    }

    public deactivate() {
        if (this.isActivated) {
            window.document.body.removeChild(this.element);
            this.isActivated = false;
        }
    }
    
    public clear() {
        this.render(new CandidateWindowStateBuilder().setComposition(new Composition("",0)).build());
    }

    public render(state: CandidateWindowState) {
        // remove all children
        this.element.innerHTML = '';
        this.element.appendChild(this.renderComposition(state.composition));
        for (let i = 0; i < state.candidateCount; ++i) {
            this.element.appendChild(this.renderCandidate(i+1, state.candidates[i], state.isHighlighted(i)));
        }
        this.show();
        this.updatePosition();
    }

    private renderComposition(state: Composition): HTMLElement {
        const div = document.createElement("div");
        div.innerHTML = `${state.text}`;
        div.style.cssText = 'font-size:16px; overflow: hidden;';
        return div;
    }

    private renderCandidate(i: number, state: Candidate, isHighlighted: boolean = false): HTMLElement {
        const div = document.createElement("div");
        const commentText = state.comment && state.comment.length > 0 ? ` (${state.comment.trim()})` : '';
        div.innerHTML = `${i}. ${state.text}${commentText}`;
        div.style.cssText = `
            font-size:16px;
            overflow: hidden;
            ${isHighlighted && 'background: #e1eeef;'}
            border-radius: 2px;
            padding-left: 2px;`;
        return div;
    }

    private onFocusEvent = (e: FocusEvent) =>  {
        let target : HTMLElement = (e.target as HTMLElement);
        if (target.tagName == "TEXTAREA" || target.tagName == "INPUT") {
            this.focusedListeners.forEach(listener => {
                listener(target);
            })
            this.capturingKeys = true;
            this.activeInputElement = target;
            this.show();
        }
        console.log(e);
    }

    private onBlurEvent = (e: FocusEvent) => {
        if (e.type == "blur" && e.target == this.activeInputElement) {
            this.blurredListeners.forEach(listener => {
                listener(this.activeInputElement);
            });
            this.activeInputElement = null;
            this.capturingKeys = false;
            this.hide();
        }
    }

    private show() {
        this.element.style.display = "block";
        this.updatePosition();
    }

    public hide() {
        this.element.style.display = "none";
    }

    private updatePosition() {
        const caret = getCaretCoordinates(this.activeInputElement, (this.activeInputElement as any).selectionEnd, {});
        const desiredTop = this.activeInputElement.offsetTop + caret.top + (isNaN(caret.height) ? 0 : caret.height) + 20;
        const desiredLeft = this.activeInputElement.offsetLeft + caret.left + 50;
        console.log(desiredTop, desiredLeft);
        this.element.style.top = `${desiredTop}px`;
        this.element.style.left = `${desiredLeft}px`;
    }

}