
// Interfaces

export interface Attribute {
    attr: string;
    value: string;
}

export interface CustomHTMLElement {
    element: string;
    attributes?: Attribute[];
}

export function createHTMLElement(htmlElement: CustomHTMLElement) {
    let elem = document.createElement(htmlElement.element);
    
    htmlElement.attributes.forEach(attribute => {
        elem.setAttribute(attribute.attr, attribute.value);
    });

    return elem as HTMLElement;
}

export function createHTMLChild(
    parent: HTMLElement, 
    htmlElement: CustomHTMLElement) {
        // takes parent element and appends/creates child element
        // returns the child element.

        let html = createHTMLElement(htmlElement);
        parent.appendChild(html);

        return html;
}