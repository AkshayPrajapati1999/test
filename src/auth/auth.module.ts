import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserEntity } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        forwardRef(() => UserModule),
        TypeOrmModule.forFeature([UserCredentials, UserEntity]),
        PassportModule,
        JwtModule.register({
            secret: 'secret',
        }),
    ],
    providers: [AuthService, TokenService, AuthResolver, JwtStrategy],
    exports: [AuthService, TokenService],
})
export class AuthModule { }
