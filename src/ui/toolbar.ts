import { ToolbarState, SvgWidget, TextWidget } from "./toolbarState";

/**
 * Floating statusbar.
 */
export class Toolbar {

    private element : HTMLElement;
    private dragHandle : HTMLElement;
    private startPos : any;
    private widgets: Array<HTMLElement> = [];
    private isShown: boolean = false;

    constructor () {
        this.element = document.createElement("div");
        this.element.style.cssText = `
            height: 30px;
            border: 1px solid #efefef;
            min-width: 50px;
            z-index: 999;
            position: fixed;
            background: #f9f9f9;
            box-shadow: 0px 3px 9px 3px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
            -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
            -khtml-user-select: none; /* Konqueror HTML */
            -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none;
        `;
        this.dragHandle = document.createElement('div');
        this.dragHandle.style.cssText = `
            height: 30px;
            display: inline-block;
            background: #cfcfcf;
            cursor: move;
            width:10px;
            float:left;
        `;
        this.element.appendChild(this.dragHandle);
    }

    private createSvgWidget(src: string, paddingTop:number, paddingLeft: number, imgWidth: number) : HTMLElement {
        const elem = document.createElement('div');
        elem.style.cssText = `
            height: 30px; 
            display: inline-block; 
            width: 30px;
            float: left;
            /*background: red;*/
        `;
        elem.innerHTML = `
            <img alt="" src="${src}" style="width: ${imgWidth}px; margin-top: ${paddingTop}px; margin-left: ${paddingLeft}px;" width="${imgWidth}" />
        `
        return elem;
    }

    private createTextWidget(text: string): HTMLElement {
        const elem = document.createElement('div');
        elem.style.cssText = `
            height: 30px;
            display: inline-block;
            width: auto;
            float: left;
            line-height: 30px;
            font-size: 12px;
            color: #777;
            padding-left: 5px;
            padding-right: 5px;
            border-left: 0.5px solid #ccc;
        `;
        elem.innerText = text;
        return elem;
    }


    private addWidget(e: HTMLElement) {
        this.widgets.push(e);
        this.element.appendChild(e);
        this.reposition();
    }

    private removeAllWidgets() {
        this.widgets.forEach(widget => {
            this.element.removeChild(widget);
        });
        this.widgets = [];
        this.reposition();
    }

    public init() {
        document.body.appendChild(this.element);
        this.element.style.display = 'none';
        window.onresize = this.onWindowResize;
    }

    public show() {
        if (!this.isShown) {
            this.element.style.display = 'block';
            this.element.style.top = `${window.innerHeight - this.element.clientHeight - 20}px`;
            this.element.style.left = `${window.innerWidth - this.element.clientWidth - 200}px`;
            this.reposition();
            this.dragHandle.onmousedown = this.dragMouseDown;
            this.isShown = true;
        }
    }

    public hide() {
        if (this.isShown) {
            this.element.style.display = 'none';
            this.dragHandle.onmousedown = null;
            this.isShown = false;
        }
    }

    public render(state: ToolbarState) {
        this.removeAllWidgets();
        state.widgets.forEach(widget => {
            switch (widget.type) {
            case 'svg': {
                const tmp = widget as SvgWidget;
                this.addWidget(this.createSvgWidget(tmp.src, tmp.paddingTop, tmp.paddingLeft, tmp.imgWidth));
                break;
            }
            case 'text': {
                const tmp = widget as TextWidget;
                this.addWidget(this.createTextWidget(tmp.text));
                break;
            }
            }
        });
        this.reposition();
    }

    private onWindowResize = (e: UIEvent) => {
        console.log(e);
        this.reposition();
    }

    private reposition() {
        const rect = this.element.getBoundingClientRect();
        if (rect.right > window.innerWidth -5) {
            this.element.style.left = `${rect.left + (window.innerWidth-5 - rect.right)}px`;
        }
        if (rect.bottom > window.innerHeight-5) {
            this.element.style.top = `${rect.top + (window.innerHeight-5 - rect.bottom)}px`;
        }
    }

    private dragMouseDown = (e: MouseEvent) => {
        e.preventDefault();

        this.startPos = {
            x: e.clientX,
            y: e.clientY
        }
        
        document.onmouseup = this.stopDragging;
        document.onmousemove = this.dragMouseMove;
    }

    private stopDragging = () => {
        document.onmouseup = null;
        document.onmousemove = null;
        this.reposition();
    }

    private dragMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const newPos = {
            x: e.clientX,
            y: e.clientY
        };
        const rect = this.element.getBoundingClientRect();
        this.element.style.top = `${rect.top + (newPos.y - this.startPos.y)}px`;
        this.element.style.left = `${rect.left + (newPos.x - this.startPos.x)}px`;
        this.startPos = {
            ...newPos
        }
    }
   
}