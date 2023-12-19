import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredentials } from './user.credentials.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserEntity } from './user.entity';
import { TokenService } from 'src/auth/token.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/email/mail.service';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { PrivacyPolicy } from 'src/privacy-policy/privacy-policy.entity';
import { UserPrivacyPolicyEntity } from 'src/privacy-policy/user-privacy-policy.entity';
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
        TypeOrmModule.forFeature([CategoryEntity, SubCategoryEntity, SessionEntity, PrivacyPolicy, UserPrivacyPolicyEntity, UserEntity, UserCredentials, UserSessionsEntity, UserAchievementsEntity]),
    ],
    providers: [PrivacyPolicyService, MailService, TokenService, CategoryService, DescriptionService, SubCategoryService, UserService, JwtService, SessionService, UserResolver],
    exports: [UserService]
})
export class UserModule { }
