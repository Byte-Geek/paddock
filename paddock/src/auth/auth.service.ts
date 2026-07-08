import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}
    
    async register(
        createUserDto: CreateUserDto
    ): Promise<{ message: string; user: CreateUserDto }> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
        createUserDto.password = hashedPassword

        await this.userService.createUser(createUserDto)

        return {
            message: 'You are registered',
            user: createUserDto,
        }
    }

    async signIn(email: string, password: string):Promise<any> {
        const user = await this.userService.user({ email })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('Invalid password')
        }
        const {password:_, ...result} = user
        const payload = { email: result.email, sub: result.id }
        return {
            access_token: await this.jwtService.signAsync(payload),
        }

    }
}
