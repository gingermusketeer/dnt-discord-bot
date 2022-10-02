import { ActivityData, Info } from './activity.interface';
import { parseNbDateToUtc } from './activity.utils';

function cleanString(rawString?: string | null) {
  rawString ??= '';
  return rawString.replace(/\s+/g, ' ').trim();
}
function cleanArray(strings: string[]) {
  return strings.map(cleanString).filter((el) => el.length > 0);
}

export function parseInfo(node: Element): Info {
  const listNode = node.querySelector('.aktivitet-info dl');
  const groups: [string, string?][] = [];
  let currentGroup: [string, string?];
  Array.from(listNode?.children ?? []).forEach((element) => {
    if (element.tagName == 'DT') {
      currentGroup = [cleanString(element.textContent)];
      groups.push(currentGroup);
    } else {
      currentGroup.push(cleanString(element.textContent));
    }
  });
  const data: Info = {
    tripCode: '',
    tripArea: [],
    organiser: [],
    tripType: [],
    audience: [],
    difficulty: '',
    endsAt: null,
    startsAt: null,
  };
  groups.forEach(([key, value]) => {
    if (!value) {
      return;
    }
    switch (key) {
      case 'Fra dato':
        data.startsAt = parseNbDateToUtc(value)[0];
        return;
      case 'Til dato':
        data.endsAt = parseNbDateToUtc(value)[0];
        return;
      case 'Dato':
        const dates = parseNbDateToUtc(value);
        data.startsAt = dates[0];
        data.endsAt = dates.at(1) ?? null;
        return;
      case 'Vanskelighetsgrad':
        data.difficulty = value;
        return;
      case 'Passer spesielt for':
        data.audience = cleanArray(value.split(','));
        return;
      case 'Turtyper':
        data.tripType = cleanArray(value.split(','));
        return;
      case 'Arrangører':
        data.organiser = cleanArray(value.split(','));
        return;
      case 'Turområde':
        data.tripArea = cleanArray(value.split(',')).map((area) =>
          area.replace(' (se kart)', ''),
        );
        return;
      case 'Turkode':
        data.tripCode = value;
        return;
    }
    return;
  }, data);

  return data;
}

export function extractActivityData(url: string, document: Document) {
  const node = document.querySelector('.aktivitet-info .heading');
  if (!node) {
    throw new Error('No meta data');
  }

  const nb = document.querySelector('.description span[data-dnt-lang="nb"]');
  const en = document.querySelector('.description span[data-dnt-lang="en"]');
  const title = cleanString(document.querySelector('.title')?.textContent);
  const images = document.querySelectorAll('#carousel .item');
  const media = Array.from(images)
    .map((node) => {
      const img = node.querySelector('img');
      const caption = node.querySelector('.carousel-caption');
      if (!img) {
        return;
      }
      return {
        url: img.src,
        caption: caption?.textContent ?? '',
      };
    })
    .filter((val) => val) as ActivityData['media'];
  const info = parseInfo(document.body);
  return {
    id: url.split('/').slice(-3).join('/'),
    url,
    title,
    type: cleanString(node.textContent),
    descriptionNb: nb?.textContent?.trim(),
    descriptionEn: en?.textContent?.trim(),
    media,
    updatedAt: new Date(),
    ...info,
  };
}
