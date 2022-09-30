import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { parseNbDate } from './activity.utils';

describe('parsing dates', () => {
  const referenceDate = new Date('2022-01-01');
  it('handles common dates', () => {
    assert.deepEqual(
      parseNbDate('8. november kl. 18:25 - 20:00', referenceDate),
      [
        new Date('2022-11-08T18:25:00.000Z'),
        new Date('2022-11-08T20:00:00.000Z'),
      ],
    );
    assert.deepEqual(parseNbDate('6. oktober kl. 18:00', referenceDate), [
      new Date('2022-10-06T18:00:00.000Z'),
    ]);
    assert.deepEqual(
      parseNbDate('6. desember kl. 18:25 - 20:00', referenceDate),
      [
        new Date('2022-12-06T18:25:00.000Z'),
        new Date('2022-12-06T20:00:00.000Z'),
      ],
    );
    assert.deepEqual(parseNbDate('6. desember', referenceDate), [
      new Date('2022-12-06T00:00:00.000Z'),
    ]);
  });
});
