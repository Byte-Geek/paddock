import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService) {}
    async register(createUserDto: CreateUserDto): Promise<{ message: string, user: CreateUserDto }> {

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);        
        createUserDto.password = hashedPassword;

        await this.userService .createUser(createUserDto);

        return {
            message: "You are registered",
            user: createUserDto
        };
    }
}
