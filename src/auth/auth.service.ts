import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MESSAGES } from 'src/common/utils/constants';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ValidateTokenDto } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserCredentials)
        private usersCredentials: Repository<UserCredentials>,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new HttpException(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = await this.userService.comparePasswords(
            password,
            user.credential.password,
        );
        if (!isPasswordValid) {
            throw new HttpException(MESSAGES.AUTH.INVALID_PASSWORD, null);
        }
        return user;
    }

    async validateToken(dto: ValidateTokenDto) {
        const validToken = this.usersCredentials.create({
            token: dto.token,
            deviceToken: dto.deviceToken,
        });
        return validToken;
    }
}
