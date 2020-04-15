import { ScrollDirection, scrollSnapToNext, getScrollSnapPositions } from 'scroll-snap-api';

export class ScrollSnapArrows {

  arrows: Record<ScrollDirection, HTMLElement[]> = {
    left: [],
    right: [],
    up: [],
    down: [],
  }

  private directions: ScrollDirection[] = [ 'left', 'right', 'up', 'down' ];

  constructor( protected element: HTMLElement ) {

    this.populateArrows();

    this.addEventListeners();

  }

  populateArrows() {

    for ( const direction of this.directions ) {

      const dataAttribute = 'scrollSnapArrow' + ( capitalize( direction ) );
      const selector = this.element.dataset[ dataAttribute ];

      if ( selector ) {
        for ( const arrow of document.querySelectorAll<HTMLElement>( selector ) ) {
          this.addArrow( direction, arrow );
        }
      }

    }

  }

  addEventListeners() {

    this.element.addEventListener( 'scroll', debounce( this.updateArrows.bind( this ), 100 ) );

  }

  addArrow( direction: ScrollDirection, element: HTMLElement ) {

    this.arrows[ direction ].push( element );

    element.addEventListener( 'click', this.arrowOnClick.bind( this, direction ) );

    this.updateArrows();

  }

  arrowOnClick( direction: ScrollDirection ) {

    scrollSnapToNext( this.element, direction );

  }

  updateArrows() {

    const positions = getScrollSnapPositions( this.element );

    const [ positionsLeft, positionsRight ] = bifurcate( positions.x, this.element.scrollLeft, 2 );
    const [ positionsUp, positionsDown ] = bifurcate( positions.y, this.element.scrollTop, 2 );

    this.toggleArrows( 'left', positionsLeft.length > 0 );
    this.toggleArrows( 'right', positionsRight.length > 0 );
    this.toggleArrows( 'up', positionsUp.length > 0 );
    this.toggleArrows( 'down', positionsDown.length > 0 );

  }

  toggleArrows( direction: ScrollDirection, show: boolean ) {
    this.arrows[ direction ].forEach( arrow => arrow.hidden = !show );
  }

}

function capitalize( text: string ) {
  if ( text.length === 0 ) return '';
  return text.substr( 0, 1 ).toUpperCase() + text.substr( 1 );
}

function debounce( fn: ( ...args: any[] ) => any, timeout: number ): (...args: any[]) => void {
  let old: number;
  return ( ...args ) => {
    if ( old ) {
      clearTimeout( old );
    }
    old = window.setTimeout( fn, timeout, ...args );
  };
}

function bifurcate( items: number[], midpoint: number, threshold = 0 ) {
  const lesser: number[] = [];
  const greater: number[] = [];
  items.forEach( item => {
    if ( Math.abs( item - midpoint ) <= threshold ) {
      return; // Too close
    }
    if ( item < midpoint ) {
      lesser.push( item );
    }
    if ( item > midpoint ) {
      greater.push( item );
    }
  } );
  return [ lesser, greater ];
}
