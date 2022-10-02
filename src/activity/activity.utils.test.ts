import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { formatInTimeZone } from 'date-fns-tz';

import { parseNbDateToUtc } from './activity.utils';

describe('parsing dates', () => {
  function formatDates(dates: Date[]) {
    return dates.map((date) =>
      formatInTimeZone(date, 'Europe/Oslo', 'yyyy-MM-dd HH:mm:ss:sss zzz'),
    );
  }

  it('handles winter dates', () => {
    // Winter time is GMT+1
    assert.deepEqual(
      formatDates(parseNbDateToUtc('8. november kl. 18:25 - 20:00')),
      ['2022-11-08 18:25:00:000 GMT+1', '2022-11-08 20:00:00:000 GMT+1'],
    );
  });

  it('handles summer dates', () => {
    // Summer time is GMT+1
    assert.deepEqual(formatDates(parseNbDateToUtc('6. oktober kl. 18:00')), [
      '2022-10-06 18:00:00:000 GMT+2',
    ]);
    assert.deepEqual(
      formatDates(parseNbDateToUtc('6. juli kl. 00:00 - 20:00')),
      ['2022-07-06 00:00:00:000 GMT+2', '2022-07-06 20:00:00:000 GMT+2'],
    );
  });

  it('handles dates without a time', () => {
    assert.deepEqual(formatDates(parseNbDateToUtc('6. desember')), [
      '2022-12-06 00:00:00:000 GMT+1',
    ]);
  });
  it('handles dates with a year', () => {
    assert.deepEqual(formatDates(parseNbDateToUtc('15. mars 2023 kl. 19:00')), [
      '2023-03-15 19:00:00:000 GMT+1',
    ]);
  });
});
