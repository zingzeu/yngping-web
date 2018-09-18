import { getCaretCoordinates } from './caretPosition';
import { CandidateWindowState, Composition, Candidate, CandidateWindowStateBuilder } from './candidateWindowState';

export class CandidateWindow {

    private element: HTMLDivElement;
    private isActivated : boolean = false;
    private capturingKeys : boolean = false;
    private activeInputElement : HTMLElement = null;

    constructor () {
        this.element = document.createElement("div");
        this.element.style.cssText = "position: absolute; border: 1px red solid; min-width:100px; z-index:1000; width:100px; min-height: 200px;"
        this.hide();
    }

    public activate() {
        if (!this.isActivated) {
            window.document.body.appendChild(this.element);
            document.addEventListener("focus", this.onFocusEvent, true);
            document.addEventListener("blur", this.onBlurEvent, true);
            document.addEventListener("keydown", this.onKeyDown, true);
            this.isActivated = true;
        }
    }

    public deactivate() {
        if (this.isActivated) {
            window.document.body.removeChild(this.element);
            this.isActivated = false;
        }
    }
    
    public render(state: CandidateWindowState) {
        // remove all children
        this.element.innerHTML = '';
        this.element.appendChild(this.renderComposition(state.composition));
        for (let i = 0; i < state.candidateCount; ++i) {
            this.element.appendChild(this.renderCandidate(state.candidates[i], state.isHighlighted(i)));
        }
        this.updatePosition();
    }

    private renderComposition(state: Composition): HTMLElement {
        const div = document.createElement("div");
        div.innerHTML = `${state.text}`;
        div.style.cssText = 'font-size:12px; overflow: hidden;';
        return div;
    }

    private renderCandidate(state: Candidate, isHighlighted: boolean = false): HTMLElement {
        const div = document.createElement("div");
        div.innerHTML = `${state.text} (${state.comment})`;
        div.style.cssText = 'font-size:12px; overflow: hidden;';
        return div;
    }

    private onFocusEvent = (e: FocusEvent) =>  {
        let target : HTMLElement = (e.target as HTMLElement);
        if (target.tagName == "TEXTAREA" || target.tagName == "INPUT") {
            this.capturingKeys = true;
            this.activeInputElement = target;
            this.show();
        }
        console.log(e);
    }

    private onBlurEvent = (e: FocusEvent) => {
        if (e.type == "blur" && e.target == this.activeInputElement) {
            this.activeInputElement = null;
            this.capturingKeys = false;
            this.hide();
        }
    }

    private show() {
        this.element.style.display = "block";
        this.updatePosition();
    }

    private hide() {
        this.element.style.display = "none";
    }

    private updatePosition() {
        const caret = getCaretCoordinates(this.activeInputElement, (this.activeInputElement as any).selectionEnd, {});
        this.element.style.top = `${this.activeInputElement.offsetTop + caret.top + caret.height + 20}`;
        this.element.style.left = `${this.activeInputElement.offsetLeft + caret.left + 50}`;
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (this.capturingKeys) {
            console.log("Suppressing key: ", e.key, e.keyCode, e.metaKey, e.shiftKey);
            e.preventDefault();
            console.log(getCaretCoordinates(this.activeInputElement, (this.activeInputElement as any).selectionEnd, {}));
            this.render(new CandidateWindowStateBuilder()
                .setComposition(new Composition(e.key,0))
                .addCandidate(new Candidate("First", "some"))
                .addCandidate(new Candidate("Second", "some"))
                .addCandidate(new Candidate("Third", "haha"))
                .addCandidate(new Candidate("Last", "some"))
                .build())
        }
    }
}