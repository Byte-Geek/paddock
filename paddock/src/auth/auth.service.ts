import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    async register(createUserDto: CreateUserDto): Promise<{ message: string, user: CreateUserDto }> {

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;

        return {
            message: "You are registered",
            user: createUserDto
        };
    }
}
