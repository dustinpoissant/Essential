import {
  isType
} from './type.js';

export const createElement =  str => new DOMParser().parseFromString(str, 'text/html').body.childNodes[0];

export const on = (element, events, ...handlers) => {
  if(isType(element, 'string')){
    document.querySelectorAll(element).forEach(e => on(e, events, ...handlers));
  } else if(element instanceof Arary || element instanceof NodeList){
    element.forEach( e => on(e, events, ...handlers));
  } else if(element instanceof Node){
    events.split(' ').forEach( event => {
      handlers.forEach( handler => {
        element.addEventListener(event, handler);
      });
    });
  }
}

export const off = (element, events, ...handlers) => {
  if(isType(element, 'string')){
    document.querySelectorAll(element).forEach(e => off(e, events, ...handlers));
  } else if(element instanceof Array || element instanceof NodeList){
    element.forEach( e => off(e, events, ...handlers));
  } else if(element instanceof Node){
    events.split(' ').forEach( event => {
      handlers.forEach( handler => {
        element.removeEventListener(event, handler);
      });
    });
  }
}

export const dispatch = (element, events, data = {}, options = {}) => {
  if(isType(element, 'string')){
    document.querySelectorAll(element).forEach(e => dispatch(e, events, data, options));
  } else if(element instanceof Array || element instanceof NodeList){
    element.forEach( e => dispatch(e, events, data, options));
  } else if(element instanceof Node){
    events.split(' ').forEach( event => {
      element.dispatchEvent(new CustomEvent(event, {
        detail: data,
        ...options
      }));
    });
  }
}