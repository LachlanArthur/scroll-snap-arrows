function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function scrollSnapToNext(element, direction) {
  var scrollToOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    behavior: 'smooth'
  };
  // Pretend we're already this many pixels past the current scroll point in the direction we want to go.
  // Helps avoid rounding errors in element sizes.
  var scrollFuzz = 2;
  var axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  var sign = direction === 'right' || direction === 'down' ? '+' : '-';
  var maxScroll = axis === 'x' ? element.scrollWidth - element.offsetWidth : element.scrollHeight - element.offsetHeight;
  var scrollSnapPositions = getScrollSnapPositions(element)[axis];

  if (sign === '-') {
    scrollFuzz *= -1;
  }

  var currentScrollPosition = element[axis === 'x' ? 'scrollLeft' : 'scrollTop'] + scrollFuzz;
  var nextScrollPositions = scrollSnapPositions.filter(pos => {
    if (sign === '+') {
      return pos > currentScrollPosition;
    } else {
      return pos < currentScrollPosition;
    }
  }).sort((a, b) => sign === '+' ? a - b : b - a);
  var nextScrollPosition;

  if (nextScrollPositions.length > 0) {
    nextScrollPosition = nextScrollPositions[0];
  } else {
    if (sign === '+') {
      nextScrollPosition = maxScroll;
    } else {
      nextScrollPosition = 0;
    }
  } // scrollTo might return a promise in the future


  return element.scrollTo(_objectSpread2({}, scrollToOptions, {
    [axis === 'x' ? 'left' : 'top']: nextScrollPosition
  }));
}

function getScrollPadding(element) {
  var style = window.getComputedStyle(element);
  var rect = element.getBoundingClientRect();
  var xBeforeRaw = style.getPropertyValue('scroll-padding-left').replace('auto', '0px');
  var yBeforeRaw = style.getPropertyValue('scroll-padding-top').replace('auto', '0px');
  var xAfterRaw = style.getPropertyValue('scroll-padding-right').replace('auto', '0px');
  var yAfterRaw = style.getPropertyValue('scroll-padding-bottom').replace('auto', '0px');
  /**
   * Convert a CSS length to a number.
   * @param raw CSS length value
   * @param size Parent size, used for percentage lengths
   */

  function convert(raw, size) {
    var n = parseFloat(raw);

    if (/%/.test(raw)) {
      n /= 100;
      n *= size;
    }

    return n;
  }

  var xBefore = convert(xBeforeRaw, rect.width);
  var yBefore = convert(yBeforeRaw, rect.height);
  var xAfter = convert(xAfterRaw, rect.width);
  var yAfter = convert(yAfterRaw, rect.height);
  return {
    x: {
      before: xBefore,
      after: xAfter
    },
    y: {
      before: yBefore,
      after: yAfter
    }
  };
}

function domRectIntersects(a, b) {
  var axis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'both';
  return axis === 'x' && a.right >= b.left && a.left <= b.right || axis === 'y' && a.bottom >= b.top && a.top <= b.bottom || axis === 'both' && a.right >= b.left && a.left <= b.right && a.bottom >= b.top && a.top <= b.bottom;
}

function getAllDescendants(parent) {
  var children = [];

  for (var child of parent.children) {
    children = children.concat(child, getAllDescendants(child));
  }

  return children;
}

function getSnapPositions(parent) {
  var excludeOffAxis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var parentRect = parent.getBoundingClientRect();
  var positions = {
    x: {
      start: [],
      center: [],
      end: []
    },
    y: {
      start: [],
      center: [],
      end: []
    }
  };
  var descendants = getAllDescendants(parent);
  ['x', 'y'].forEach(axis => {
    var orthogonalAxis = axis === 'x' ? 'y' : 'x';
    var offsetStart = axis === 'x' ? 'offsetLeft' : 'offsetTop';
    var offsetSize = axis === 'x' ? 'offsetWidth' : 'offsetHeight';

    for (var child of descendants) {
      var childRect = child.getBoundingClientRect(); // Skip child if it doesn't intersect the parent's opposite axis (it can never be in view)

      if (excludeOffAxis && !domRectIntersects(parentRect, childRect, orthogonalAxis)) {
        continue;
      }

      var childStyle = window.getComputedStyle(child);
      var [childAlignY, childAlignX] = childStyle.getPropertyValue('scroll-snap-align').split(' ');

      if (typeof childAlignX === 'undefined') {
        childAlignX = childAlignY;
      }

      var childAlign = axis === 'x' ? childAlignX : childAlignY;

      switch (childAlign) {
        case 'none':
          break;

        case 'start':
          positions[axis].start.push(child[offsetStart]);
          break;

        case 'center':
          positions[axis].center.push(child[offsetStart] + child[offsetSize] / 2);
          break;

        case 'end':
          positions[axis].end.push(child[offsetStart] + child[offsetSize]);
          break;
      }
    }
  });
  return positions;
}

function getScrollSnapPositions(element) {
  var rect = element.getBoundingClientRect();
  var scrollPadding = getScrollPadding(element);
  var snapPositions = getSnapPositions(element);
  var maxScroll = {
    x: element.scrollWidth - element.offsetWidth,
    y: element.scrollHeight - element.offsetHeight
  };

  var clamp = (min, max) => value => Math.max(min, Math.min(max, value));

  return {
    x: unique([...snapPositions.x.start.map(v => v - scrollPadding.x.before), ...snapPositions.x.center.map(v => v - rect.width / 2), ...snapPositions.x.end.map(v => v - rect.width + scrollPadding.x.after)].map(clamp(0, maxScroll.x))),
    y: unique([...snapPositions.y.start.map(v => v - scrollPadding.y.before), ...snapPositions.y.center.map(v => v - rect.height / 2), ...snapPositions.y.end.map(v => v - rect.height + scrollPadding.y.after)].map(clamp(0, maxScroll.y)))
  };
}

function unique(iterable) {
  return Array.from(new Set(iterable));
}

class ScrollSnapArrows {
  constructor(element) {
    this.element = element;
    this.arrows = {
      left: [],
      right: [],
      up: [],
      down: []
    };
    this.directions = ['left', 'right', 'up', 'down'];
    this.populateArrows();
    this.addEventListeners();
  }

  populateArrows() {
    for (var direction of this.directions) {
      var dataAttribute = 'scrollSnapArrow' + capitalize(direction);
      var selector = this.element.dataset[dataAttribute];

      if (selector) {
        for (var arrow of document.querySelectorAll(selector)) {
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
    var positions = getScrollSnapPositions(this.element);
    var [positionsLeft, positionsRight] = bifurcate(positions.x, this.element.scrollLeft, 2);
    var [positionsUp, positionsDown] = bifurcate(positions.y, this.element.scrollTop, 2);
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
  if (text.length === 0) return '';
  return text.substr(0, 1).toUpperCase() + text.substr(1);
}

function debounce(fn, timeout) {
  var old;
  return function () {
    if (old) {
      clearTimeout(old);
    }

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    old = window.setTimeout(fn, timeout, ...args);
  };
}

function bifurcate(items, midpoint) {
  var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var lesser = [];
  var greater = [];
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
//# sourceMappingURL=index.bundled.js.map
