export interface Attribute {
    attr: string;
    value: string;
}
export interface CustomHTMLElement {
    element: string;
    attributes?: Attribute[];
}
export declare function createHTMLElement(htmlElement: CustomHTMLElement): HTMLElement;
export declare function createHTMLChild(parent: HTMLElement, htmlElement: CustomHTMLElement): HTMLElement;
