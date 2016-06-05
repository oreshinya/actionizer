import assert from 'power-assert';
import sinon from 'sinon';
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

const listener = sinon.spy();
const unsubscribe = store.subscribe(listener);

toggle(false);
toggle(true);

const truthyState = store.getState();
unsubscribe();
toggle(false);

assert(listener.calledOnce);
assert(listener.calledWith(truthyState));
