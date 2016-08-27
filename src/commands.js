import { PUT, CALL, FORK, CANCEL, SELECT } from './CommandTypes';

export const select = () => {
  return { type: SELECT };
};

export const put = (nextState) => {
  return { type: PUT, nextState };
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


