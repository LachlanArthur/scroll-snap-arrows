import { scrollSnapToNext, getScrollSnapPositions } from 'scroll-snap-api';

class ScrollSnapArrows {
    constructor(element) {
        this.element = element;
        this.arrows = {
            left: [],
            right: [],
            up: [],
            down: [],
        };
        this.directions = ['left', 'right', 'up', 'down'];
        this.populateArrows();
        this.addEventListeners();
    }
    populateArrows() {
        for (const direction of this.directions) {
            const dataAttribute = 'scrollSnapArrow' + (capitalize(direction));
            const selector = this.element.dataset[dataAttribute];
            if (selector) {
                for (const arrow of document.querySelectorAll(selector)) {
                    this.addArrow(direction, arrow);
                }
            }
        }
    }
    addEventListeners() {
        this.element.addEventListener('scroll', debounce(this.updateArrows.bind(this), 100));
    }
    addArrow(direction, element) {
        this.arrows[direction].push(element);
        element.addEventListener('click', this.arrowOnClick.bind(this, direction));
        this.updateArrows();
    }
    arrowOnClick(direction) {
        scrollSnapToNext(this.element, direction);
    }
    updateArrows() {
        const positions = getScrollSnapPositions(this.element);
        const [positionsLeft, positionsRight] = bifurcate(positions.x, this.element.scrollLeft, 2);
        const [positionsUp, positionsDown] = bifurcate(positions.y, this.element.scrollTop, 2);
        this.toggleArrows('left', positionsLeft.length > 0);
        this.toggleArrows('right', positionsRight.length > 0);
        this.toggleArrows('up', positionsUp.length > 0);
        this.toggleArrows('down', positionsDown.length > 0);
    }
    toggleArrows(direction, show) {
        this.arrows[direction].forEach(arrow => arrow.hidden = !show);
    }
}
function capitalize(text) {
    if (text.length === 0)
        return '';
    return text.substr(0, 1).toUpperCase() + text.substr(1);
}
function debounce(fn, timeout) {
    let old;
    return (...args) => {
        if (old) {
            clearTimeout(old);
        }
        old = window.setTimeout(fn, timeout, ...args);
    };
}
function bifurcate(items, midpoint, threshold = 0) {
    const lesser = [];
    const greater = [];
    items.forEach(item => {
        if (Math.abs(item - midpoint) <= threshold) {
            return; // Too close
        }
        if (item < midpoint) {
            lesser.push(item);
        }
        if (item > midpoint) {
            greater.push(item);
        }
    });
    return [lesser, greater];
}

export { ScrollSnapArrows };
//# sourceMappingURL=index.js.map
