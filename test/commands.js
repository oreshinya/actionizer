import assert from 'power-assert';
import { test } from 'eater/runner';

import { select, put, call } from '../src';

const selectPayload = select();

test('"select" returns select payload', () => {
  assert(selectPayload.type === 'ACTIONIZER.ACTION.SELECT');
});

const putPayload = put(1);

test('"put" returns put payload', () => {
  assert(putPayload.type === 'ACTIONIZER.ACTION.PUT');
  assert(putPayload.nextState === 1);
});

const hoge = () => {};
const callPayload = call(hoge, 1, 2, 3);

test('"call" returns call payload', () => {
  assert(callPayload.type === 'ACTIONIZER.ACTION.CALL');
  assert(callPayload.fn === hoge);
  assert(callPayload.args[0] === 1);
  assert(callPayload.args[1] === 2);
  assert(callPayload.args[2] === 3);
});
