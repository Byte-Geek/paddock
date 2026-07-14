import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { jwtConstants } from './constants'

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}))

describe('AuthService', () => {
    it('signs the access token with the configured expiration', async () => {
        const jwtService = {
            signAsync: jest.fn().mockResolvedValue('signed-token'),
        }

        const userService = {
            user: jest.fn().mockResolvedValue({
                id: 1,
                email: 'user@example.com',
                password: 'hashed-password',
                role: 'admin',
                name: 'User',
            }),
        }

        ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: userService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile()

        const service = moduleRef.get(AuthService)

        await service.signIn('user@example.com', 'plain-password')

        expect(jwtService.signAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'user@example.com',
                sub: 1,
                role: 'admin',
            }),
            { expiresIn: jwtConstants.expiresIn },
        )
    })
})
