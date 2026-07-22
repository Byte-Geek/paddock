import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from 'src/user/user.module'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from 'src/auth/constants'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './auth.guard'
import { RolesGuard } from './roles.guard'

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.expiresIn as any },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
