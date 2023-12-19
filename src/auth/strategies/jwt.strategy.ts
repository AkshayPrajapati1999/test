import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { payloadModel } from 'src/common/utils/payloadModel';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: 'secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate() {
    return {
      userId: payloadModel.userId,
      firstName: payloadModel.firstName,
      lastName: payloadModel.lastName,
    };
  }
}
