import { CALL, FORK, REDUCE, CANCEL, SELECT } from './CommandTypes';

export const select = (selector = (state) => state) => {
  return { type: SELECT, selector };
};

export const reduce = (reducer) => {
  return { type: REDUCE, reducer };
};

export const call = (fn, ...args) => {
  return { type: CALL, fn, args };
};

export const fork = (actionCreator, ...args) => {
  return { type: FORK, actionCreator, args };
};

export const cancel = (actionId) => {
  return { type: CANCEL, actionId };
};


