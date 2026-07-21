import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { PrismaModule } from './prisma.module'
import { HomeModule } from './home/home.module'
import { CoachModule } from './coach/coach.module'

@Module({
    imports: [PrismaModule, AuthModule, UserModule, HomeModule, CoachModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
