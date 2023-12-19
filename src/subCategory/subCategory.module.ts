import { Module } from '@nestjs/common';
import { SubCategoryService } from './subCategory.service';
import { SubCategoryResolver } from './subCategory.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategoryEntity } from './subCategory.entity';
import { CategoryService } from 'src/category/category.service';
import { CategoryEntity } from 'src/category/category.entity';
import { SessionEntity } from 'src/session/session.entity';
import { SubCategoryImageController } from './subCategory.controller';
import { TokenService } from 'src/auth/token.service';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { PrivacyPolicy } from 'src/privacy-policy/privacy-policy.entity';
import { UserPrivacyPolicyEntity } from 'src/privacy-policy/user-privacy-policy.entity';
import { MailService } from 'src/email/mail.service';
import { UserEntity } from 'src/user/user.entity';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { UserAchievementsEntity } from 'src/achievement/userAchievement.entity';
import { SessionService } from 'src/session/session.service';
import { DescriptionService } from 'src/description.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivacyPolicy, UserPrivacyPolicyEntity, UserCredentials, CategoryEntity, UserEntity, UserSessionsEntity, UserAchievementsEntity, SessionEntity, SubCategoryEntity])
  ],
  providers: [PrivacyPolicyService, MailService, TokenService, UserService, DescriptionService, JwtService, SubCategoryService, CategoryService, SessionService, SubCategoryResolver],
  controllers: [SubCategoryImageController]
})
export class SubCategoryModule { }
