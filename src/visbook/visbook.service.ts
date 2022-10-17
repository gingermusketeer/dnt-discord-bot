import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VisbookApi } from './visbook.api';

@Injectable()
export class VisbookService {
  private readonly apiClient = new VisbookApi();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {}
}
