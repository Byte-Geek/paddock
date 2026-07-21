import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { PrismaModule } from './prisma.module'
import { HomeModule } from './home/home.module'
import { CoachModule } from './coach/coach.module'
import { GroupModule } from './group/group.module'
import { AthleteModule } from './athlete/athlete.module'
import { StatsModule } from './stats/stats.module'
import { EventModule } from './event/event.module'
import { ProtocolTemplateModule } from './protocol-template/protocol-template.module'
import { ProfileModule } from './profile/profile.module'

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        UserModule,
        HomeModule,
        CoachModule,
        GroupModule,
        AthleteModule,
        StatsModule,
        EventModule,
        ProtocolTemplateModule,
        ProfileModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
