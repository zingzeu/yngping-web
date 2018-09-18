export class Candidate {
    private readonly _text: string;
    public get text() : string {
        return this._text;
    }
    private readonly _comment: string;
    public get comment(): string {
        return this._comment;
    }
    
    constructor (text: string, comment: string) {
        this._text = text;
        this._comment = comment;
    }
}

export class Composition {
    private readonly _text : string;
    public get text() : string {
        return this._text;
    }

    private readonly _cursorPos : number;
    public get cursorPos() : number {
        return this._cursorPos;
    }

    constructor (text: string, cursorPos: number) {
        this._text = text;
        this._cursorPos = cursorPos;
    }
}

export class CandidateWindowState {
    private readonly _composition: Composition;
    public get composition(): Composition {
        return this._composition;
    }
    private readonly _candidates: Array<Candidate>;
    public get candidates(): Array<Candidate> {
        return this._candidates;
    }
    private readonly _highlightedItem?: number;
    public isHighlighted(index: number): boolean {
        return index == this._highlightedItem;
    }

    public get candidateCount() {
        return this._candidates.length;
    }

    constructor (composition: Composition, candidates: Array<Candidate>, highlightedIndex?: number) {
        this._composition = composition;
        this._candidates = candidates;
        this._highlightedItem = highlightedIndex;
        if (this._highlightedItem < 0 || this._highlightedItem >= this.candidateCount) {
            throw new Error("Invalid highlight");
        }
    }

}

export class CandidateWindowStateBuilder {
    private candidates: Array<Candidate> = [];
    private composition: Composition = null;
    private highlightedIndex: number = -1;
    
    constructor() {

    }

    public setComposition(c: Composition): CandidateWindowStateBuilder {
        this.composition = c;
        return this;
    }

    public addCandidate(c: Candidate): CandidateWindowStateBuilder {
        this.candidates.push(c);
        return this;
    }

    public setHighLighted(i: number): CandidateWindowStateBuilder {
        this.highlightedIndex = i;
        return this;
    }

    public build(): CandidateWindowState {
        if (this.highlightedIndex == -1) {
            return new CandidateWindowState(this.composition, this.candidates);
        } else {
            return new CandidateWindowState(this.composition, this.candidates, this.highlightedIndex);
        }
        
    }

}