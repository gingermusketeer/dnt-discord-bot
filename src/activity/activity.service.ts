import { Injectable, OnModuleInit } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { ActivityDatabaseService } from 'src/activityDatabase/activityDatabase.service';
import { extractActivityData } from './activity.parser';
import * as cron from 'node-cron';

import { ConfigService } from '@nestjs/config';
import Ajv from 'ajv/dist/jtd';
import { ActivityData, ActivityDataSchema } from './activity.interface';

@Injectable()
export class ActivityService implements OnModuleInit {
  private task: cron.ScheduledTask;
  constructor(
    private readonly configService: ConfigService,
    private readonly activityDatabaseService: ActivityDatabaseService,
  ) {}
  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'production') {
      this.task = cron.schedule('0 10 * * *', this.on10am);
      console.log('setup 10am activity scrapping');
    }
    this.on10am();
  }

  on10am() {
    console.log('starting 10am activity scrapping');
    this.fetchAndUploadActivityData().catch((error) => {
      console.error('fetchAndUploadActivityData failed with error', error);
    });
  }

  async fetchAndUploadActivityData() {
    const activityData = await this.fetchAllActivityData();
    const ajv = new Ajv();
    const validator = ajv.compile(ActivityDataSchema);
    const invalidData = activityData.filter((data) => {
      return !validator(data);
    });
    console.log(JSON.stringify(invalidData, null, 2));

    const error = await this.activityDatabaseService.upsertActivities(
      activityData,
    );
    console.log(error);
  }

  async fetchAllActivityData() {
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
    return activityData;
  }

  async getActivityData(url: string): Promise<ActivityData> {
    const html = await this.makeRequest(url);
    const {
      window: { document },
    } = new JSDOM(html);
    return extractActivityData(url, document);
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
