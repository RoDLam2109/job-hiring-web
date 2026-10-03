import { Public } from "@/decorator/customize";
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from "@nestjs/terminus";

//controller
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: MongooseHealthIndicator,
    ) { }
    @Get()
    @Public()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.db.pingCheck('database'),
        ]);
    }
}