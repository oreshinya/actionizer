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
import axios from 'axios';
import { fromJS } from 'immutable';
import { createStore, select, call, put } from 'actionizer';
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

// Create a store, it treats all states for the app.
const store = createStore(initialState, notify);

// Define an action.
const count = function*(num) {
  // Get current state.
  const state = yield select();

  // Set next state.
  yield put(state.set("counter", num));
}

// API request.
const getItems = (id, field) => {
  return axios.get('/items', {id, field});
};

// Define an asynchronous action.
const fetchItems = function*() {
  try {
    // "call" receives a function and arguments that returns a promise.
    const result = yield call(getItems, '1,3,5,39', 'name,createdAt');

    // Do something...
  } catch(e) {
    // Do something...
  }
};

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

## LICENSE

MIT
