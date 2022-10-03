import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { formatInTimeZone } from 'date-fns-tz';

import { groupByKeys } from './activityDatabase.utils';

describe('grouping by keys', () => {
  it('handles undefined', () => {
    assert.deepEqual(groupByKeys([{ a: 1 }, { a: undefined }]), [
      [{ a: 1 }],
      [{ a: undefined }],
    ]);
  });

  it('handles values being present', () => {
    assert.deepEqual(groupByKeys([{ a: 1 }, { a: false }]), [
      [{ a: 1 }, { a: false }],
    ]);
  });

  it('handles multiple keys being present', () => {
    assert.deepEqual(
      groupByKeys([
        { a: 1, b: 2 },
        { a: false, b: 'pizza' },
      ]),
      [
        [
          { a: 1, b: 2 },
          { a: false, b: 'pizza' },
        ],
      ],
    );
  });

  it('handles multiple keys with undefined values', () => {
    assert.deepEqual(groupByKeys([{ a: 1 }, { a: false, b: undefined }]), [
      [{ a: 1 }, { a: false, b: undefined }],
    ]);
  });
});
