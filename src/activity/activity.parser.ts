import { parseNbDate } from './activity.utils';

function cleanString(rawString: string | null) {
  rawString ??= '';
  return rawString.replace(/\s+/g, ' ').trim();
}
function cleanArray(strings: string[]) {
  return strings.map(cleanString);
}

type Info = {
  tripCode: string;
  tripArea: string[];
  organiser: string[];
  tourType: string[];
  audience: string[];
  difficulty: string;
  endsAt: Date;
  startsAt?: Date;
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

  const info: Info = groups.reduce((acc, [key, value]) => {
    if (!value) {
      return acc;
    }
    switch (key) {
      case 'Fra dato':
        acc.startsAt = parseNbDate(value, new Date())[0];
        return acc;
      case 'Til dato':
        acc.endsAt = parseNbDate(value, new Date())[0];
        return acc;
      case 'Dato':
        const dates = parseNbDate(value, new Date());
        acc.startsAt = dates[0];
        acc.endsAt = dates[1];
        return acc;
      case 'Vanskelighetsgrad':
        acc.difficulty = value;
        return acc;
      case 'Passer spesielt for':
        acc.audience = cleanArray(value.split(','));
        return acc;
      case 'Turtyper':
        acc.tourType = cleanArray(value.split(','));
        return acc;
      case 'Arrangører':
        acc.organiser = cleanArray(value.split(','));
        return acc;
      case 'Turområde':
        acc.tripArea = cleanArray(value.split(',')).map((area) =>
          area.replace(' (se kart)', ''),
        );
        return acc;
      case 'Turkode':
        acc.tripCode = value;
        return acc;
    }
    return acc;
  }, {} as Info);

  return info;
}
