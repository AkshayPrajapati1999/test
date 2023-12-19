import { Module } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicyResolver } from './privacy-policy.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyPolicy } from './privacy-policy.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/email/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserEntity } from 'src/user/user.entity';
import { UserPrivacyPolicyEntity } from './user-privacy-policy.entity';
import { TokenService } from 'src/auth/token.service';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { UserAchievementsEntity } from 'src/achievement/userAchievement.entity';
import { SessionService } from 'src/session/session.service';
import { DescriptionService } from 'src/description.service';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { CategoryEntity } from 'src/category/category.entity';
import { SessionEntity } from 'src/session/session.entity';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { CategoryService } from 'src/category/category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, SessionEntity, SubCategoryEntity, PrivacyPolicy, UserPrivacyPolicyEntity, UserCredentials, UserEntity, UserSessionsEntity, UserAchievementsEntity])
  ],
  providers: [TokenService, MailService, JwtService, CategoryService, SubCategoryService, DescriptionService, PrivacyPolicyService, UserService, PrivacyPolicyResolver, SessionService]
})
export class PrivacyPolicyModule { }
