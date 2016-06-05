import assert from 'power-assert';
import { Map } from 'immutable';

import { createStore } from '../src';

const initialState = Map({
  flag: false
});

const store = createStore(initialState);

assert(store.getState() === initialState);
