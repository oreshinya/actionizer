# Actionizer
[![Build Status](https://travis-ci.org/oreshinya/actionizer.svg?branch=master)](https://travis-ci.org/oreshinya/actionizer)

This is just pub/sub for data flow.

## Installation

```
$ npm i --save actionizer
```

## Usage

```javascript
import { fromJS } from 'immutable';
import { createStore } from 'actionizer';

const initialState = fromJS({
  counter: 0,
  items: {
    1: {id: 1, name: 'hoge'},
    2: {id: 2, name: 'fuga'}
  }
});

// Create a store, it treats all states for the app.
const store = createStore(initialState);

// Define an action.
const count = store.actionize((next, getState) => (num) => {
  const nextState = getState().set("counter", num);
  next(nextState);
});

// Subscribe store's change.
store.subscribe((state) => {
  console.log(`listener: ${state.get("counter")}`);
});

count(100);

// => listener: 100

```
