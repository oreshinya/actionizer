import { CALL, FORK, REDUCE, CANCEL, SELECT, DELEGATE } from './CommandTypes';

export function select(selector = (state) => state) {
  return { type: SELECT, selector };
}

export function reduce(reducer, ...args) {
  return { type: REDUCE, reducer, args };
}

export function call(fn, ...args) {
  return { type: CALL, fn, args };
}

export function fork(actionCreator, ...args) {
  return { type: FORK, actionCreator, args };
}

export function delegate(actionCreator, ...args) {
  return { type: DELEGATE, actionCreator, args };
}

export function cancel(actionId) {
  return { type: CANCEL, actionId };
}
