import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './notification.entity';
import { UserNotificationEntity } from './userNotification.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/email/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserEntity } from 'src/user/user.entity';
import { TokenService } from 'src/auth/token.service';
import { PushNotificationLog } from './pushNotification.entity';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { PrivacyPolicy } from 'src/privacy-policy/privacy-policy.entity';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { UserPrivacyPolicyEntity } from 'src/privacy-policy/user-privacy-policy.entity';
import { UserAchievementsEntity } from 'src/achievement/userAchievement.entity';
import { SessionService } from 'src/session/session.service';
import { CategoryEntity } from 'src/category/category.entity';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { DescriptionService } from 'src/description.service';
import { CategoryService } from 'src/category/category.service';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { SessionEntity } from 'src/session/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, SessionEntity, SubCategoryEntity, PrivacyPolicy, UserPrivacyPolicyEntity, UserNotificationEntity, PushNotificationLog, NotificationEntity, UserCredentials, UserEntity, UserSessionsEntity, UserAchievementsEntity])
  ],
  providers: [PrivacyPolicyService, TokenService, MailService, JwtService, DescriptionService, CategoryService, SubCategoryService, NotificationService, NotificationResolver, UserService, SessionService]
})
export class NotificationModule { }
