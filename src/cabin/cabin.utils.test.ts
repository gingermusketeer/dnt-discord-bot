import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { dateIsValid, getVisbookId } from './cabin.utils';

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

describe('Extract visbook cabin id from booking URL', () => {
  it('finds id in reservations url', () => {
    const url = 'https://reservations.visbook.com/6093';
    assert.deepEqual(getVisbookId(url), 6093);
  });
  it('finds id in bookings url (NO)', () => {
    const url = 'https://booking.visbook.com/no/5546';
    assert.deepEqual(getVisbookId(url), 5546);
  });
  it('finds id in bookings url (EN)', () => {
    const url = 'https://booking.visbook.com/en/5546';
    assert.deepEqual(getVisbookId(url), 5546);
  });
  it('returns 0 if not found', () => {
    const url = 'https://reservations.visbook.com';
    assert.deepEqual(getVisbookId(url), 0);
  });
});
