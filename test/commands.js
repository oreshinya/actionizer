import assert from 'power-assert';
import { test } from 'eater/runner';

import { select, put, call, fork, cancel } from '../src';

const selectPayload = select();

test('"select" returns select payload', () => {
  assert(selectPayload.type === 'ACTIONIZER.ACTION.SELECT');
});

const putPayload = put(1);

test('"put" returns put payload', () => {
  assert(putPayload.type === 'ACTIONIZER.ACTION.PUT');
  assert(putPayload.nextState === 1);
});

const asyncFn = () => {
  return new Promise((resolve) => {
    resolve();
  });
};
const callPayload = call(asyncFn, 1, 2, 3);

test('"call" returns call payload', () => {
  assert(callPayload.type === 'ACTIONIZER.ACTION.CALL');
  assert(callPayload.fn === asyncFn);
  assert(callPayload.args[0] === 1);
  assert(callPayload.args[1] === 2);
  assert(callPayload.args[2] === 3);
});

const actionCreator = function*() {};
const forkPayload = fork(actionCreator, 1, 2, 3);

test('"fork" returns fork payload', () => {
  assert(forkPayload.type === 'ACTIONIZER.ACTION.FORK');
  assert(forkPayload.actionCreator === actionCreator);
  assert(forkPayload.args[0] === 1);
  assert(forkPayload.args[1] === 2);
  assert(forkPayload.args[2] === 3);
});

const actionId = 'testActionId';
const cancelPayload = cancel(actionId);

test('"cancel" returns cancel payload', () => {
  assert(cancelPayload.type === 'ACTIONIZER.ACTION.CANCEL');
  assert(cancelPayload.actionId === actionId);
});
