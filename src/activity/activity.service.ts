import { Injectable, OnModuleInit } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { ActivityDatabaseService } from 'src/activityDatabase/activityDatabase.service';
import { Info, parseInfo } from './activity.parser';
function cleanString(rawString: string | null) {
  rawString ??= '';
  return rawString.replace(/\s+/g, ' ').trim();
}

import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
const ajv = new Ajv();

type NewType = {
  id: string;
  url: string;
  type: string;
  descriptionNb?: string;
  descriptionEn?: string;
  media: { url: string; caption: string }[];
  updatedAt: Date;
} & Info;

const schema: JTDSchemaType<NewType> = {
  properties: {
    id: { type: 'string' },
    url: { type: 'string' },
    type: { type: 'string' },
    media: {
      elements: {
        properties: { url: { type: 'string' }, caption: { type: 'string' } },
      },
    },
    updatedAt: { type: 'timestamp' },
    tripCode: { type: 'string' },
    tripArea: { elements: { type: 'string' } },
    organiser: { elements: { type: 'string' } },
    tripType: { elements: { type: 'string' } },
    audience: { elements: { type: 'string' } },
    difficulty: { type: 'string' },
    endsAt: { type: 'timestamp', nullable: true },
    startsAt: { type: 'timestamp', nullable: true },
  },
  optionalProperties: {
    descriptionEn: { type: 'string' },
    descriptionNb: { type: 'string' },
  },
};

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
    const validator = ajv.compile(schema);
    const validData = activityData.filter((data) => {
      return validator(data);
    });
    const invalidData = activityData.filter((data) => {
      return !validator(data);
    });
    console.log(JSON.stringify(invalidData, null, 2));

    const error = await this.activityDatabaseService.upsertActivities(
      activityData,
    );
  }

  async getActivityData(path: string): Promise<NewType> {
    const url = 'https://ung.dntoslo.no' + path;
    const html = await this.makeRequest(url);
    const {
      window: { document },
    } = new JSDOM(html);
    const node = document.querySelector('.aktivitet-info .heading');
    if (!node) {
      throw new Error('No meta data');
    }

    const nb = document.querySelector('.description span[data-dnt-lang="nb"]');
    const en = document.querySelector('.description span[data-dnt-lang="en"]');
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
      .filter((val) => val) as NewType['media'];
    const info = parseInfo(document.body);
    return {
      id: path.split('/').slice(-3).join('/'),
      url,
      type: cleanString(node.textContent),
      descriptionNb: nb?.textContent?.trim(),
      descriptionEn: en?.textContent?.trim(),
      media,
      updatedAt: new Date(),
      ...info,
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
