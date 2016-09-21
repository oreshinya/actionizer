import assert from 'power-assert';
import { test } from 'eater/runner';

import { select, reduce, call, fork, cancel } from '../src/commands';

const selector = (state) => state;
const selectPayload = select(selector);

test('"select" returns select payload', () => {
  assert(selectPayload.type === 'ACTIONIZER.COMMAND.SELECT');
  assert(selectPayload.selector === selector);
});

const reducer = (state) => ({...state});
const reducePayload = reduce(reducer, 1, 2);

test('"reduce" returns reduce payload', () => {
  assert(reducePayload.type === 'ACTIONIZER.COMMAND.REDUCE');
  assert(reducePayload.reducer === reducer);
  assert(reducePayload.args[0] === 1);
  assert(reducePayload.args[1] === 2);
});

const asyncFn = () => {
  return new Promise((resolve) => {
    resolve();
  });
};
const callPayload = call(asyncFn, 1, 2, 3);

test('"call" returns call payload', () => {
  assert(callPayload.type === 'ACTIONIZER.COMMAND.CALL');
  assert(callPayload.fn === asyncFn);
  assert(callPayload.args[0] === 1);
  assert(callPayload.args[1] === 2);
  assert(callPayload.args[2] === 3);
});

const actionCreator = function*() {};
const forkPayload = fork(actionCreator, 1, 2, 3);

test('"fork" returns fork payload', () => {
  assert(forkPayload.type === 'ACTIONIZER.COMMAND.FORK');
  assert(forkPayload.actionCreator === actionCreator);
  assert(forkPayload.args[0] === 1);
  assert(forkPayload.args[1] === 2);
  assert(forkPayload.args[2] === 3);
});

const actionId = 'testActionId';
const cancelPayload = cancel(actionId);

test('"cancel" returns cancel payload', () => {
  assert(cancelPayload.type === 'ACTIONIZER.COMMAND.CANCEL');
  assert(cancelPayload.actionId === actionId);
});
