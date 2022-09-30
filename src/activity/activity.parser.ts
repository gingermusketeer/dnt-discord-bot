import { parseNbDate } from './activity.utils';

function cleanString(rawString: string | null) {
  rawString ??= '';
  return rawString.replace(/\s+/g, ' ').trim();
}
function cleanArray(strings: string[]) {
  return strings.map(cleanString).filter((el) => el.length > 0);
}

export type Info = {
  tripCode: string;
  tripArea: string[];
  organiser: string[];
  tripType: string[];
  audience: string[];
  difficulty: string;
  endsAt: Date | null;
  startsAt: Date | null;
};

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
        data.startsAt = parseNbDate(value, new Date())[0];
        return;
      case 'Til dato':
        data.endsAt = parseNbDate(value, new Date())[0];
        return;
      case 'Dato':
        const dates = parseNbDate(value, new Date());
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
