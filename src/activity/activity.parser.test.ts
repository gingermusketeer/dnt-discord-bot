import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import * as assert from 'node:assert';
import { parseInfo, extractActivityData } from './activity.parser';
describe('parseInfo', () => {
  function getNode(html: string) {
    const dom = new JSDOM(html);
    const element = dom.window.document.body.firstElementChild;
    if (!element) {
      throw new Error('No element in the provided HTML');
    }
    return element;
  }
  function getDocument(html: string) {
    const dom = new JSDOM(html);
    return dom.window.document;
  }
  it('parses complex tours', () => {
    const data = readFileSync('src/activity/examples/info-1.html', 'utf8');
    const result = parseInfo(getNode(data));
    assert.deepEqual(result, {
      startsAt: new Date('2022-09-30T04:40'),
      endsAt: new Date('2022-10-02T18:15'),
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
      audience: ['Seniorer'],
      difficulty: 'Enkel',
      endsAt: new Date('2022-09-30T09:00:00.000Z'),
      organiser: [],
      startsAt: new Date('2022-09-30T08:00:00.000Z'),
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

  it('parses minimal tours', () => {
    const data = readFileSync('src/activity/examples/info-3.html', 'utf8');
    const result = parseInfo(getNode(data));
    assert.deepEqual(result, {
      audience: ['Voksne', 'Ungdom', 'Fjellsportinteresserte'],
      difficulty: 'Enkel',
      endsAt: null,
      organiser: [],
      startsAt: new Date('2022-09-30T16:00:00.000Z'),
      tripArea: [],
      tripCode: '',
      tripType: [],
    });
  });

  it('parses canceled trips', () => {
    const data = readFileSync('src/activity/examples/canceled.html', 'utf8');
    const { updatedAt, descriptionNb, ...result } = extractActivityData(
      'pizza-url',
      getDocument(data),
    );
    assert.deepEqual(result, {
      id: 'pizza-url',
      url: 'pizza-url',
      title: 'Avlyst Skjerdingfjelltraversen',
      type: 'Fellestur',
      descriptionEn: '',
      media: [],
      cancelled: true,
      requiresSignUp: true,
      tripCode: '',
      tripArea: [],
      organiser: ['KNT Fjellsport', 'DNT fjellsport'],
      tripType: [],
      audience: [],
      signUpAt: undefined,
      difficulty: 'Krevende',
      endsAt: new Date('2022-09-17T16:00:00.000Z'),
      startsAt: new Date('2022-09-17T06:00:00.000Z'),
    });
    assert.equal(
      descriptionNb?.slice(0, 100),
      'Høstværet har allerede kommet, og hva er vel da mer fristende enn å komme seg til fjells i Norges va',
    );
  });

  it('parses trips needing signup', () => {
    const data = readFileSync('src/activity/examples/signup.html', 'utf8');
    const { updatedAt, descriptionNb, descriptionEn, ...result } =
      extractActivityData('pizza-url', getDocument(data));
    assert.deepEqual(result, {
      id: 'pizza-url',
      url: 'pizza-url',
      title:
        'Frokostbuldring med DNT ung Oslo (13-30 år) Breakfast boulder session with DNT Ung (13 - 30 years)',
      type: 'Annet',
      media: [],
      cancelled: false,
      requiresSignUp: true,
      tripCode: '',
      tripArea: [],
      organiser: [
        'DNT ung Oslo',
        'DNT Oslo og Omegn',
        'Friluftshuset Sørenga',
        'Frivilligturer DNT OO',
      ],
      tripType: ['Annet', 'Dnt', 'Dntung', 'Buldring', 'English'],
      audience: ['Ungdom', 'Fjellsportinteresserte'],
      difficulty: 'Enkel',
      signUpAt: undefined,
      endsAt: new Date('2022-10-03T06:30:00.000Z'),
      startsAt: new Date('2022-10-03T04:30:00.000Z'),
    });
    assert.equal(
      descriptionEn?.slice(0, 100),
      'Get the best start to the week with a breakfast boulder session. Bring your friends, family or colle',
    );
  });
});
