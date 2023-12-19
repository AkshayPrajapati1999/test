import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { CategoryEntity } from 'src/category/category.entity';
import { SessionEntity } from './session.entity';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { CategoryService } from 'src/category/category.service';
import { UserSessionsEntity } from './userSession.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/email/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserEntity } from 'src/user/user.entity';
import { TokenService } from 'src/auth/token.service';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { PrivacyPolicy } from 'src/privacy-policy/privacy-policy.entity';
import { UserPrivacyPolicyEntity } from 'src/privacy-policy/user-privacy-policy.entity';
import { SessionAudioController } from './session.controller';
import { UserAchievementsEntity } from 'src/achievement/userAchievement.entity';
import { DescriptionService } from 'src/description.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivacyPolicy,UserPrivacyPolicyEntity, SubCategoryEntity, UserCredentials, CategoryEntity, UserEntity, SessionEntity, UserSessionsEntity, UserAchievementsEntity]),
  ],
  controllers: [SessionAudioController],
  providers: [PrivacyPolicyService, TokenService, MailService, JwtService, SessionService, DescriptionService, CategoryService, SessionResolver, SubCategoryService, UserService]
})
export class SessionModule { }
