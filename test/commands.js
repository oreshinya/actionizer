import assert from 'power-assert';
import { test } from 'eater/runner';

import { select, reduce, call, fork, cancel, delegate } from '../src/commands';

test('"select" returns select payload', () => {
  const selector = (state) => state;
  const payload = select(selector);

  assert(payload.type === 'ACTIONIZER.COMMAND.SELECT');
  assert(payload.selector === selector);
});

test('"reduce" returns reduce payload', () => {
  const reducer = (state) => ({...state});
  const payload = reduce(reducer, 1, 2);

  assert(payload.type === 'ACTIONIZER.COMMAND.REDUCE');
  assert(payload.reducer === reducer);
  assert(payload.args[0] === 1);
  assert(payload.args[1] === 2);
});

test('"call" returns call payload', () => {
  const asyncFn = () => {
    return new Promise((resolve) => {
      resolve();
    });
  };
  const payload = call(asyncFn, 1, 2, 3);

  assert(payload.type === 'ACTIONIZER.COMMAND.CALL');
  assert(payload.fn === asyncFn);
  assert(payload.args[0] === 1);
  assert(payload.args[1] === 2);
  assert(payload.args[2] === 3);
});

test('"fork" returns fork payload', () => {
  const actionCreator = function*() {};
  const payload = fork(actionCreator, 1, 2, 3);

  assert(payload.type === 'ACTIONIZER.COMMAND.FORK');
  assert(payload.actionCreator === actionCreator);
  assert(payload.args[0] === 1);
  assert(payload.args[1] === 2);
  assert(payload.args[2] === 3);
});

test('"cancel" returns cancel payload', () => {
  const actionId = 'testActionId';
  const payload = cancel(actionId);
  assert(payload.type === 'ACTIONIZER.COMMAND.CANCEL');
  assert(payload.actionId === actionId);
});


test('"delegate" returns delegate payload', () => {
  const actionCreator = function*() {};
  const payload = delegate(actionCreator, 1, 2, 3);

  assert(payload.type === 'ACTIONIZER.COMMAND.DELEGATE');
  assert(payload.actionCreator === actionCreator);
  assert(payload.args[0] === 1);
  assert(payload.args[1] === 2);
  assert(payload.args[2] === 3);
});
