import { Injectable } from '@nestjs/common';
import { CabinUtApi } from './cabinUt.api';

@Injectable()
export class CabinUtService {
  constructor(private readonly cabinUtApi: CabinUtApi) {}
}
