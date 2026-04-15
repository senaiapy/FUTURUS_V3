import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const version = process.env.PUBLIC_APP_VERSION || 'unknown';
    return `PY Foundation 2026 version=${version}`;
  }
}
