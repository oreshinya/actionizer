import assert from 'power-assert';
import { test } from 'eater/runner';
import sinon from 'sinon';
import { Map } from 'immutable';

import { createStore, select, call, put } from '../src';

const initialState = Map({
  flag: false
});

const store = createStore(initialState);

const toggle = function*(nextFlag) {
  const state = yield select();
  yield put(state.set("flag", nextFlag));
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
    let state = yield select();
    state = yield put(state.set('sleepResult', result));
    assert(state.get('sleepResult') === 100);
  }

  const asyncFailure = function*() {
    try {
      const result = yield call(sleep, true);
    } catch(e) {
      let state = yield select();
      state = yield put(state.set('sleepResult', e));
      assert(state.get('sleepResult') === 99);
    }
  }

  const childAction = function*() {
    let state = yield select();
    state = yield put(state.set('childResult', 'child'));
    return state;
  }

  const parentAction = function*() {
    let state = yield* childAction();
    state = yield put(state.set('parentResult', 'parent'));
    assert(state.get('parentResult') === 'parent');
    assert(state.get('childResult') === 'child');
  }

  store.dispatch(asyncSuccess());
  store.dispatch(asyncFailure());
  store.dispatch(parentAction());

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


