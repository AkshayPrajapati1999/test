import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementResolver } from './achievement.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsEntity } from './achievement.entity';
import { UserEntity } from 'src/user/user.entity';
import { UserAchievementsEntity } from './userAchievement.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/email/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { TokenService } from 'src/auth/token.service';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { PrivacyPolicy } from 'src/privacy-policy/privacy-policy.entity';
import { UserPrivacyPolicyEntity } from 'src/privacy-policy/user-privacy-policy.entity';
import { SessionService } from 'src/session/session.service';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { SessionEntity } from 'src/session/session.entity';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { CategoryService } from 'src/category/category.service';
import { CategoryEntity } from 'src/category/category.entity';
import { DescriptionService } from 'src/description.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, SessionEntity, SubCategoryEntity, PrivacyPolicy, UserPrivacyPolicyEntity, AchievementsEntity, UserEntity, UserCredentials, UserAchievementsEntity, UserSessionsEntity])
  ],
  providers: [PrivacyPolicyService, TokenService, MailService, DescriptionService, CategoryService, SubCategoryService, JwtService, AchievementService, UserService, AchievementResolver, SessionService]
})
export class AchievementModule { }
