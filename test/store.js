import assert from 'power-assert';
import { test } from 'eater/runner';
import sinon from 'sinon';
import { Map } from 'immutable';

import { createStore } from '../src';
import { select, call, reduce, cancel, fork, delegate } from '../src/commands';

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
    const state = yield reduce((state, sleepResult) => state.set('sleepResult', sleepResult), result);
    assert(state.get('sleepResult') === 100);
    const selected = yield select((state) => state.get('sleepResult'));
    assert(selected === 100);
  }

  const asyncFailure = function*() {
    try {
      const result = yield call(sleep, true);
    } catch(e) {
      const state = yield reduce((state, sleepResult) => state.set('sleepResult', sleepResult), e);
      assert(state.get('sleepResult') === 99);
    }
  }

  const childAction = function*(num) {
    yield reduce((state) => state.set('childResult', num));
    return num * 2;
  }

  const parentAction = function*() {
    const result = yield delegate(childAction, 7);
    const state = yield reduce((state) => state.set('parentResult', result));
    assert(state.get('parentResult') === 14);
    assert(state.get('childResult') === 7);
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


