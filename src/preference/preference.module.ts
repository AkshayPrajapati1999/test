import { Module } from '@nestjs/common';
import { PreferencesService } from './preference.service';
import { PreferenceResolver } from './preference.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferencesEntity } from './preference.entity';
import { UserPreferencesEntity } from './userPreference.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/email/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserEntity } from 'src/user/user.entity';
import { TokenService } from 'src/auth/token.service';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { PrivacyPolicy } from 'src/privacy-policy/privacy-policy.entity';
import { UserPrivacyPolicyEntity } from 'src/privacy-policy/user-privacy-policy.entity';
import { UserImageController } from 'src/user/user.controller';
import { UserAchievementsEntity } from 'src/achievement/userAchievement.entity';
import { SessionService } from 'src/session/session.service';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { SessionEntity } from 'src/session/session.entity';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { CategoryService } from 'src/category/category.service';
import { CategoryEntity } from 'src/category/category.entity';
import { DescriptionService } from 'src/description.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, SubCategoryEntity, SessionEntity, PrivacyPolicy, UserPrivacyPolicyEntity, PreferencesEntity, UserPreferencesEntity, UserCredentials, UserEntity, UserSessionsEntity, UserAchievementsEntity])
  ],
  controllers: [UserImageController],
  providers: [PrivacyPolicyService, TokenService, MailService, CategoryService, DescriptionService, SubCategoryService, JwtService, PreferencesService, PreferenceResolver, UserService, SessionService]
})
export class PreferenceModule { }
