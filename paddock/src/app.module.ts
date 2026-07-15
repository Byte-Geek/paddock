import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { PrismaModule } from './prisma.module'
import { DashboardController } from './dashboard/dashboard.controller'

@Module({
    imports: [PrismaModule, AuthModule, UserModule],
    controllers: [AppController, DashboardController],
    providers: [AppService],
})
export class AppModule {}
