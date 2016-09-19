import assert from 'power-assert';

import { compose } from '../src';

const dbl = (n) => n * 2;
const incr = (n) => n + 1;

assert(compose(dbl, incr)(2) === 6);
assert(compose(incr, dbl)(2) === 5);
