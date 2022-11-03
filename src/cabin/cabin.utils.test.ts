import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { dateIsValid, hasExceededTimeLimit } from './cabin.utils';

describe('Checking time limit', () => {
  it('returns false if time limit is not passed', () => {
    assert.deepEqual(hasExceededTimeLimit(1000, 1001, 5), false);
  });
  it('returns true if time limit is passed', () => {
    assert.deepEqual(hasExceededTimeLimit(1000, 2000, 5), true);
  });
});

describe('Validating input as date string yyyy-mm-dd', () => {
  it('returns true for valid date string', () => {
    assert.deepEqual(dateIsValid('2022-10-16'), true);
  });
  it('returns false for invalid date string', () => {
    assert.deepEqual(dateIsValid('2022-10-66'), false);
  });
  it('returns false for any string', () => {
    assert.deepEqual(dateIsValid('hello'), false);
  });
});
