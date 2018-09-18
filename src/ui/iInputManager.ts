export type InputFocusedEventListener = (element: HTMLElement) => void;

export interface IInputManager {
    registerInputFocusedListener(listener: InputFocusedEventListener);
    registerInputBlurredListener(listener: InputFocusedEventListener);
    commitText(text: string): boolean;
}