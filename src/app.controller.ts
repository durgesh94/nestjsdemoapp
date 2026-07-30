import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('app') // Swagger tag for App
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns a success message indicating the application is running',
  })
  @ApiOkResponse({
    description: 'Application is running successfully',
    schema: {
      type: 'string',
      example: 'Nest application successfully started!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
