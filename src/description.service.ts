import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DescriptionService {
  private descriptions: any;

  constructor() {
    const filePath = './src/description.json';
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    this.descriptions = JSON.parse(rawData);
  }

  getLongestSessionDescription(position: number) {
    const longestSessionDescriptions = this.descriptions?.longestSessionDescriptions || [];
    return longestSessionDescriptions[position - 1];
  }
}