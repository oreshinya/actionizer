# Actionizer
[![npm version](https://badge.fury.io/js/actionizer.svg)](https://badge.fury.io/js/actionizer)
[![Build Status](https://travis-ci.org/oreshinya/actionizer.svg?branch=master)](https://travis-ci.org/oreshinya/actionizer)

This is just pub/sub for data flow like Redux.

## Concepts

- **Less defination**
- **Easy to test**
- **Easy to use**

## Dependencies

`babel-polyfill` for ES2015 generator.

## Installation

```
$ npm i --save actionizer
```

## Usage

```javascript
import 'babel-polyfill';
import axios from 'axios';
import { fromJS } from 'immutable';
import {
  createStore,
  select,
  call,
  put,
  fork,
  cancel
} from 'actionizer';
import debounce from 'lodash.debounce';

const initialState = fromJS({
  counter: 0,
  items: {
    1: {id: 1, name: 'hoge'},
    2: {id: 2, name: 'fuga'}
  }
});

// Customize notifier.
const notify = debounce((emit) => { emit(); });

// Create "Store", it treats states for the app.
const store = createStore(initialState, notify);

// Define "Action Creator".
const count = function*(num) {
  // Get current state.
  const state = yield select();
  const nextState = state.set("counter", num);
  // Set next state.
  yield put(nextState);
}

// API request.
const getItems = (id, field) => {
  return axios.get('/items', {id, field});
};

// Define asynchronous "Action Creator".
const fetchItems = function*(id, field) {
  try {
    // "call" receives a function and arguments that returns a promise.
    const result = yield call(getItems, id, field);

    // Do something...
  } catch(e) {
    // Do something...
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, ms);
  });
};

// Define debounced "Action Creator".
const debouncedFetchItems = function*(id) {
  yield call(sleep, 1000);
  yield* fetchItems(id);
}
let actionId;
const searchItemsById = function*(id) {
  yield cancel(actionId);
  actionId = yield fork(debouncedFetchItems, id);
}

// Subscribe store's change.
const unsubscribe = store.subscribe((state) => {
  console.log(`listener: ${state.get("counter")}`);
});

// Trigger an action.
store.dispatch(count(100));

// => listener: 100

// Unsubscribe store's change.
unsubscribe();
```

## API
### Top level API
#### `createStore(initialState, notify)`
Create a store.

### Store API
#### `subscribe(listener)`
Register a listener of store's changes.
And it returns unsubscriber.

#### `dispatch(action)`
Trigger an action.
In Actionizer, "Action" is a generator like:

```javascript
// This is "Action Creator"
const count = function*(num) {
  // Get current state.
  const state = yield select();
  const nextState = state.set("counter", num);
  // Set next state.
  yield put(nextState);
}

// This is "Action"
const action = count(1);
```

#### `getState()`
Get store's state.

### Effect API
"Effects" return a payload used in "Action Creator".

#### `select(selector = (state) => state)`
`select` calls `selector` with current state, and return `selector` result.

#### `put(nextState)`
`put` sets next state to store and returns it.

#### `call(fn, ...args)`
`call` calls `fn` with `args`.
`fn` should return `Promise`.
`call` returns resolved value.

#### `fork(actionCreator, ...args)`
`fork` calls an action without blocking and returns action id.
Action id is unique.

#### `cancel(actionId)`
`cancel` cancels action by action id.

## Related projects
- [react-actionizer](https://github.com/oreshinya/react-actionizer)

## LICENSE

MIT
