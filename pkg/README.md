# scroll-snap-arrows

Add arrows to your scrollable elements that scroll to the next available snap position.

The arrow elements will automatically hide if there are no more snap positions available in its direction.

## Install

```shell
yarn add scroll-snap-arrows

npm install --save scroll-snap-arrows
```

Or use directly:

```js
import { ScrollSnapArrows } from 'https://cdn.pika.dev/scroll-snap-arrows';
```

## Usage - Data attributes

Add whichever directions you want. Pass a CSS selector as the attribute value.

Here's an example with all four directions:

```html
<div class="scrollable-element"
  data-scroll-snap-arrow-left=".left-button"
  data-scroll-snap-arrow-right=".right-button"
  data-scroll-snap-arrow-up=".up-button"
  data-scroll-snap-arrow-down=".down-button"
>
  ...
</div>

<button class="left-button">⏪</button>
<button class="right-button">⏩</button>
<button class="up-button">⏫</button>
<button class="down-button">⏬</button>

<script>
new ScrollSnapArrows( document.querySelector( '.scrollable-element' ) );
</script>
```

## Usage - JavaScript

```html
<div class="scrollable-element">
  ...
</div>

<button class="left-button">⏪</button>
<button class="right-button">⏩</button>
<button class="up-button">⏫</button>
<button class="down-button">⏬</button>

<script>
const arrows = new ScrollSnapArrows( document.querySelector( '.scrollable-element' ) );
arrows.addArrow( 'left', document.querySelector( '.left-button' ) );
arrows.addArrow( 'right', document.querySelector( '.right-button' ) );
arrows.addArrow( 'up', document.querySelector( '.up-button' ) );
arrows.addArrow( 'down', document.querySelector( '.down-button' ) );
</script>
```
