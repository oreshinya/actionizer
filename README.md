# Actionizer
[![npm version](https://badge.fury.io/js/actionizer.svg)](https://badge.fury.io/js/actionizer)
[![Build Status](https://travis-ci.org/oreshinya/actionizer.svg?branch=master)](https://travis-ci.org/oreshinya/actionizer)

This is just pub/sub for data flow like Redux.

## Overview

```

  Command -> (Web API)
    ^  _________|
    |  v
   Action -> Command -> (Reducer) -> Store -> View
     ^                                         |
     |_________________________________________|

```

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
import { createStore } from 'actionizer';
import { select, call, reduce, fork, cancel } from 'actionizer/commands';
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

// Define "Reducer"
const setCount = (state, num) => state.set('counter', num);

// Define "Action Creator".
const count = function*(num) {
  // Get current state.
  const state = yield select();

  // Update state by "Reducer"
  yield reduce(setCount, num);
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
  console.log(`listener: ${state.get('counter')}`);
});

// Dispatch "Action".
store.dispatch(count(100));

// => listener: 100

// Unsubscribe store's change.
unsubscribe();
```

## API
### Top level API
#### `createStore(initialState, notify)`
Create a store.

#### `compose(...funcs)`
Composes functions from right to left.

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
  yield reduce(setCount, num);
}

// This is "Action"
const action = count(1);
```

#### `getState()`
Get store's state.

### Command API
"Command" return a payload used in "Action Creator".

#### `select(selector = (state) => state)`
`select` calls `selector` with current state, and return `selector` result.

#### `reduce(reducer, ...args)`
`reduce` updates state by result of `reducer`.

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
