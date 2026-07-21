import { Injectable, UnauthorizedException } from '@nestjs/common'

import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcrypt'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { User } from '../generated/prisma/client.js'
import { jwtConstants } from './constants'

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}


    async signIn(
        email: string,
        password: string
    ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
        const user = await this.userService.user({ email })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('Invalid password')
        }
        const { password: _, ...userWithoutPassword } = user
        return {
            access_token: await this.signToken(user.email, user.id, user.role),
            user: userWithoutPassword,
        }
    }

    async refresh(email: string): Promise<{ access_token: string }> {
        const user = await this.userService.user({ email })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        return {
            access_token: await this.signToken(user.email, user.id, user.role),
        }
    }

    private async signToken(
        email: string,
        sub: string,
        role: string
    ): Promise<string> {
        const payload = { email, sub, role }
        return this.jwtService.signAsync(payload, {
            expiresIn: jwtConstants.expiresIn as JwtSignOptions['expiresIn'],
        })
    }
}
