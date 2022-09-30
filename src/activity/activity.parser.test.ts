import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import * as assert from 'node:assert';
import { parseInfo } from './activity.parser';
describe('parseInfo', () => {
  function getNode(html: string) {
    const dom = new JSDOM(html);
    const element = dom.window.document.body.firstElementChild;
    if (!element) {
      throw new Error('No element in the provided HTML');
    }
    return element;
  }
  it('parses complex tours', () => {
    const data = readFileSync('src/activity/examples/info-1.html', 'utf8');
    const result = parseInfo(getNode(data));
    assert.deepEqual(result, {
      startsAt: new Date('2022-09-30T06:40'),
      endsAt: new Date('2022-10-02T20:15'),
      audience: ['Fjellsportinteresserte'],
      difficulty: 'Krevende',
      organiser: [
        'DNT fjellsport Bergen',
        'Bergen og Hordaland Turlag',
        'fellestur BHT',
      ],
      tripType: [
        'Fellestur',
        'Fottur',
        'Dntfjellsport',
        'Bergenfjellsport',
        'Dntfjellsportbergen',
        'Ekstrakrevende',
      ],
      tripArea: ['Stølsheimen', 'Bergsdalen og Vossefjellene'],
      tripCode: '850',
    });
  });

  it('parses single day tours', () => {
    const data = readFileSync('src/activity/examples/info-2.html', 'utf8');
    const result = parseInfo(getNode(data));
    assert.deepEqual(result, {
      startsAt: new Date('2022-09-30T10:00'),
      endsAt: new Date('2022-09-30T11:00'),
      audience: ['Seniorer'],
      difficulty: 'Enkel',
      organiser: [],
      tripArea: ['Oslomarka'],
      tripCode: 'Friluftstrimmen',
      tripType: [
        'Arrangement',
        'Seniortrim',
        'Styrketrening',
        'Friluftstrim',
        'Jordal',
      ],
    });
  });

  it('parses something tours', () => {
    const data = readFileSync('src/activity/examples/info-3.html', 'utf8');
    const result = parseInfo(getNode(data));
    assert.deepEqual(result, {
      audience: ['Voksne', 'Ungdom', 'Fjellsportinteresserte'],
      difficulty: 'Enkel',
      endsAt: null,
      organiser: [],
      startsAt: new Date('2022-09-30T18:00:00.000Z'),
      tripArea: [],
      tripCode: '',
      tripType: [],
    });
  });
});
