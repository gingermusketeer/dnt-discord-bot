import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { dateIsValid } from './cabin.utils';

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
