import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { IAuthTokenPayload } from './auth.model';
import { LoginDto } from './auth.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(UserCredentials)
    private usersCredentials: Repository<UserCredentials>,
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(loginCredential: LoginDto) {
    loginCredential.email = loginCredential.email.toLowerCase();
    const userData = await this.userService.findByEmail(loginCredential.email);
    const payload: IAuthTokenPayload = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };

    const token = this.jwtService.sign(payload, {});
    await this.usersCredentials.update(userData.credential.id, {
      token: token,
      deviceToken: loginCredential.deviceToken,
    });
    return token;
  }

  decodeToken(token: string): IAuthTokenPayload {
    const decode = this.jwtService.decode(token, {
      json: true,
    });
    return decode as IAuthTokenPayload;
  }
}
