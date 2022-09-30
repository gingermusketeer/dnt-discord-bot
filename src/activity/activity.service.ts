import { Injectable, OnModuleInit } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { ActivityDatabaseService } from 'src/activityDatabase/activityDatabase.service';
function cleanString(rawString: string | null) {
  rawString ??= '';
  return rawString.replace(/\s+/g, ' ').trim();
}
function cleanArray(strings: string[]) {
  return strings.map(cleanString);
}
@Injectable()
export class ActivityService implements OnModuleInit {
  constructor(
    private readonly activityDatabaseService: ActivityDatabaseService,
  ) {}
  async onModuleInit() {
    const links = await this.getActivityLinks();
    const activityData = await Promise.all(
      links.map((link) => this.getActivityData(link)),
    );
    await this.activityDatabaseService.upsertActivities(activityData);
  }

  async getActivityData(path: string) {
    const url = 'https://ung.dntoslo.no' + path;
    const html = await this.makeRequest(url);
    const {
      window: { document },
    } = new JSDOM(html);
    const node = document.querySelector('.aktivitet-info .heading');
    if (!node) {
      throw new Error('No meta data');
    }

    const [date, audience, tripType, organiser] = document.querySelectorAll(
      '.aktivitet-info dl dd',
    );
    const nb = document.querySelector('.description span[data-dnt-lang="nb"]');
    const en = document.querySelector('.description span[data-dnt-lang="en"]');
    const images = document.querySelectorAll('#carousel .item');
    const media = Array.from(images).map((node) => {
      const img = node.querySelector('img');
      const caption = node.querySelector('.carousel-caption');
      return {
        url: img?.src,
        caption: caption?.textContent ?? '',
      };
    });
    const dateStr = cleanString(date.textContent);
    console.log(dateStr);
    return {
      id: path.split('/').slice(-3).join('/'),
      url,
      type: cleanString(node.textContent),
      date: dateStr,
      audience: cleanArray(audience.textContent?.split(',') ?? []),
      tripType: cleanArray(tripType.textContent?.split(',') ?? []),
      organiser: cleanArray(organiser.textContent?.split(',') ?? []),
      descriptionNb: nb?.textContent?.trim(),
      descriptionEn: en?.textContent?.trim(),
      startsAt: new Date(),
      media,
      updatedAt: new Date(),
    };
  }

  async getActivityLinks() {
    const data = await this.makeRequest('https://ung.dntoslo.no/aktiviteter/');
    const {
      window: { document },
    } = new JSDOM(data);
    const nodes = document.querySelectorAll('.aktivitet-item');
    const links = Array.from(nodes).map(({ href }: any) => href);
    return links;
  }

  async makeRequest(url: string) {
    const response = await fetch(url);
    return await response.text();
  }
}
