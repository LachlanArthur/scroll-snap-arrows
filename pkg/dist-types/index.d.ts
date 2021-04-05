import { ScrollDirection } from 'scroll-snap-api';
export declare class ScrollSnapArrows {
    protected element: HTMLElement;
    arrows: Record<ScrollDirection, HTMLElement[]>;
    private directions;
    constructor(element: HTMLElement);
    populateArrows(): void;
    addEventListeners(): void;
    addArrow(direction: ScrollDirection, element: HTMLElement): void;
    arrowOnClick(direction: ScrollDirection): void;
    updateArrows(): void;
    toggleArrows(direction: ScrollDirection, show: boolean): void;
}
