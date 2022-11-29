import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { hasExceededTimeLimit } from './cabin.utils';

describe('Checking time limit', () => {
  it('returns false if time limit is not passed', () => {
    assert.deepEqual(hasExceededTimeLimit(1000, 1001, 5), false);
  });
  it('returns true if time limit is passed', () => {
    assert.deepEqual(hasExceededTimeLimit(1000, 2000, 5), true);
  });
});
