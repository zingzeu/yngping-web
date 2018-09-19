export class ToolbarState {
    private _widgets: Array<ToolbarWidget>;
    public get widgets() {
        return this._widgets;
    }

    constructor (widgets: Array<ToolbarWidget>) {
        this._widgets = widgets;
    }
}

export interface ToolbarWidget {
    type: string;
}

export class SvgWidget implements ToolbarWidget {
    type = 'svg';
    private _src: string;
    public get src() { return this._src;}
    private _paddingTop: number;
    public get paddingTop() { return this._paddingTop; }
    private _paddingLeft: number;
    public get paddingLeft() { return this._paddingLeft; }
    private _imgWidth: number;
    public get imgWidth() { return this._imgWidth; }

    constructor (src: string, paddingTop:number, paddingLeft: number, imgWidth: number) {
        this._src = src;
        this._paddingTop = paddingTop;
        this._paddingLeft = paddingLeft;
        this._imgWidth = imgWidth;
    }
}

export class TextWidget implements ToolbarWidget {
    type = 'text';
    private _text: string;
    public get text() { return this._text;}

    constructor (text: string) {
        this._text = text;
    }
}

export class LoadingWidget extends SvgWidget {
    constructor () {
        super('static/tail-spin.svg', 5,5,20);
    }
}

export class InitWidget extends SvgWidget {
    constructor () {
        super('static/three-dots.svg', 12,5,20);
    }
}


export class ToolbarStateBuilder {
    
    private widgets : Array<ToolbarWidget> = [];

    public addTextWidget(text: string): ToolbarStateBuilder {
        this.widgets.push(new TextWidget(text));
        return this;
    }

    public addLoadingWidget(): ToolbarStateBuilder {
        this.widgets.push(new LoadingWidget());
        return this;
    }

    public addInitWidget(): ToolbarStateBuilder {
        this.widgets.push(new InitWidget());
        return this;
    }

    public build(): ToolbarState {
        return new ToolbarState(this.widgets);
    }
}