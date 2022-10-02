import { Injectable, OnModuleInit } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { ActivityDatabaseService } from 'src/activityDatabase/activityDatabase.service';
import { Info, parseInfo } from './activity.parser';
function cleanString(rawString: string | null | undefined) {
  rawString ??= '';
  return rawString.replace(/\s+/g, ' ').trim();
}

import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
const ajv = new Ajv();

type NewType = {
  id: string;
  title: string;
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
    title: { type: 'string' },
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
    const numPages = await this.getActivityPages(
      'https://www.dnt.no/aktiviteter/',
    );
    console.log(`Fetching data for ${numPages} pages`);
    let currentPage = numPages - 2;
    let links: string[] = [];
    while (currentPage <= numPages) {
      links = links.concat(
        await this.getActivityLinks(
          'https://www.dnt.no/aktiviteter/?page=' + currentPage,
        ),
      );
      currentPage += 1;
    }
    const activityData = [];
    const uniqueLinks = new Set(links);
    console.log(`Fetching data for ${uniqueLinks.size} activities`);
    for (const link of uniqueLinks) {
      try {
        activityData.push(await this.getActivityData(link));
      } catch (error) {
        console.log(error);
      }
    }
    const validator = ajv.compile(schema);
    const invalidData = activityData.filter((data) => {
      return !validator(data);
    });
    console.log(JSON.stringify(invalidData, null, 2));

    const error = await this.activityDatabaseService.upsertActivities(
      activityData,
    );
    console.log(error);
  }

  async getActivityData(url: string): Promise<NewType> {
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
      .filter((val) => val) as NewType['media'];
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

  async getActivityLinks(url: string) {
    const data = await this.makeRequest(url);
    const {
      window: { document },
    } = new JSDOM(data);
    const nodes = document.querySelectorAll('.aktivitet-item');
    const links = Array.from(nodes)
      .map(({ href }: any) => href)
      .map((path) => {
        if (!path.startsWith('http')) {
          const urlObject = new URL(url);
          urlObject.pathname = path;
          urlObject.search = '';
          path = urlObject.toString();
        }
        return path;
      });
    return links;
  }

  async getActivityPages(url: string) {
    const data = await this.makeRequest(url);
    const {
      window: { document },
    } = new JSDOM(data);
    const nodes = document.querySelectorAll('.aktivitet-item');
    const values = Array.from(
      document.querySelectorAll('.pagination a[data-page]'),
    )
      .map((el: HTMLAnchorElement) => {
        return el.dataset.page;
      })
      .map((str) => parseInt(str ?? '', 10))
      .filter((num) => !Number.isNaN(num));
    return Math.max(...values);
  }

  async makeRequest(url: string) {
    console.log(url);
    const response = await fetch(url);
    return await response.text();
  }
}
