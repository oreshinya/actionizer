import assert from 'power-assert';
import { Map } from 'immutable';

import { createStore } from '../src';

const initialState = Map({
  flag: false
});

const store = createStore(initialState);

const toggle = store.actionize((next, getState) => (nextFlag) => {
  const nextState = getState().set("flag", nextFlag);
  next(nextState);
});

toggle(true);
assert(store.getState().get("flag"));
