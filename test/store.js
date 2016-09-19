import assert from 'power-assert';
import { test } from 'eater/runner';
import sinon from 'sinon';
import { Map } from 'immutable';

import { createStore } from '../src';
import { select, call, reduce, cancel, fork } from '../src/commands';

const initialState = Map({
  flag: false,
  count: 0
});

const store = createStore(initialState);

const toggle = function*(nextFlag) {
  yield reduce((state) => state.set('flag', nextFlag));
}

test('getState', () => {
  assert(store.getState().get('flag') !== null);
});

test('dispatch', () => {
  const sleep = (error) => {
    return new Promise((resolve, reject) => {
      if (error) { return reject(99); }
      setTimeout(() => {
        resolve(100);
      }, 1000);
    });
  };

  const asyncSuccess = function*() {
    const result = yield call(sleep);
    const state = yield reduce((state) => state.set('sleepResult', result));
    assert(state.get('sleepResult') === 100);
    const selected = yield select((state) => state.get('sleepResult'));
    assert(selected === 100);
  }

  const asyncFailure = function*() {
    try {
      const result = yield call(sleep, true);
    } catch(e) {
      const state = yield reduce((state) => state.set('sleepResult', e));
      assert(state.get('sleepResult') === 99);
    }
  }

  const childAction = function*() {
    const state = yield reduce((state) => state.set('childResult', 'child'));
    return state;
  }

  const parentAction = function*() {
    yield* childAction();
    const state = yield reduce((state) => state.set('parentResult', 'parent'));
    assert(state.get('parentResult') === 'parent');
    assert(state.get('childResult') === 'child');
  }

  let actionId = null;
  const countAction = function*() {
    yield call(sleep);
    const state = yield reduce((state) => state.set('count', state.get('count') + 1));
    assert(state.get('count') === 1);
  }
  const takeLatestAction = function*() {
    yield cancel(actionId);
    actionId = yield fork(countAction);
  }

  store.dispatch(asyncSuccess());
  store.dispatch(asyncFailure());
  store.dispatch(parentAction());
  store.dispatch(takeLatestAction());
  store.dispatch(takeLatestAction());
});

test('subscribe', () => {
  const listener = sinon.spy();
  const unsubscribe = store.subscribe(listener);

  store.dispatch(toggle(false));
  store.dispatch(toggle(true));

  const truthyState = store.getState();
  unsubscribe();
  store.dispatch(toggle(false));

  assert(listener.calledOnce);
  assert(listener.calledWith(truthyState));
});


