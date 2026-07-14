import { Injectable, UnauthorizedException } from '@nestjs/common'

import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { User } from '../generated/prisma/client.js'
import { jwtConstants } from './constants'


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}


    async signIn(email: string, password: string): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
        const user = await this.userService.user({ email })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('Invalid password')
        }
        const payload = { email: user.email, sub: user.id, role: user.role }
        const { password: _, ...userWithoutPassword } = user;
        return {
            access_token: await this.jwtService.signAsync(payload, {
                expiresIn: jwtConstants.expiresIn as any,
            }),
            user: userWithoutPassword,
        }
    }
}
