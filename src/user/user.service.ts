import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { generateOTP, otpString } from 'src/common/utils/tokens.utils';
import { MailService } from 'src/email/mail.service';
import { Repository } from 'typeorm';
import {
    ChangePasswordDto,
    CreateUserDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    UpdateUserDto,
    VerifyOtpDto,
} from './user.dto';
import { UserCredentials } from './user.credentials.entity';
import { UserEntity } from './user.entity';
import { IAuthTokenPayload } from 'src/auth/auth.model';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constant';
import { UserSessionsEntity } from 'src/session/userSession.entity';
import { PrivacyPolicyService } from 'src/privacy-policy/privacy-policy.service';
import { UserAchievementsEntity } from 'src/achievement/userAchievement.entity';
import { SessionService } from 'src/session/session.service';


@Injectable()
export class UserService {
    constructor(
        @Inject(forwardRef(() => PrivacyPolicyService)) private policyService: PrivacyPolicyService,
        private mailService: MailService,
        private jwtService: JwtService,
        @InjectRepository(UserCredentials)
        private usersCredentials: Repository<UserCredentials>,
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserSessionsEntity)
        private userSessionRepository: Repository<UserSessionsEntity>,
        @InjectRepository(UserAchievementsEntity)
        private userAchievementRepository: Repository<UserAchievementsEntity>,
        private readonly sessionService: SessionService
    ) { }

    private hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    async create(createUserDto: CreateUserDto) {
        createUserDto.email = createUserDto.email.toLowerCase();
        const passwordHash = await this.hashData(createUserDto.password);
        const latestPolicy = await this.policyService.findLatestVersion();
        const latestVersion = latestPolicy.version;
        const newUser = this.usersRepository.create({
            ...createUserDto,
            isPrivacyPolicyAccepted: true
        });

        const credential = new UserCredentials();
        credential.password = passwordHash;
        newUser.credential = credential;
        newUser.firstName = newUser.firstName[0].toUpperCase() + newUser.firstName.slice(1);
        newUser.lastName = newUser.lastName[0].toUpperCase() + newUser.lastName.slice(1);
        newUser.credential.deviceToken = createUserDto.deviceToken;
        newUser.acceptedPolicyVersion = latestVersion;
        const data = await this.usersRepository.save(newUser);
        await this.policyService.userPolicy(newUser.id, latestPolicy.id);

        const payload: IAuthTokenPayload = {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        };

        const token = this.jwtService.sign(payload, {
            secret: jwtConstants.secret,
        });

        await this.usersCredentials.update(data.credential.id, {
            token: token,
        });

        return this.read(newUser.id);
      
    }

    async findAll() {
        return await this.usersRepository.find({ relations: ['credential'] });
    }

    async sendEmailForReActivate(email: string, firstName: string) {
        const user = await this.findByEmailWithDelete(email);
        const unlockOtp = generateOTP(4);
        user.credential.unlockOtp = unlockOtp;
        user.credential.unlockOtpExpires = new Date(Date.now() + 600000);
        await this.usersRepository.save(user);
        await this.mailService.sendAccountVErification(email, firstName, unlockOtp);
        return unlockOtp;
    }

    async getUser(id: number) {
        const data = await this.usersRepository.findOne({
            where: {
                id: id,
            },
            relations: ['credential'],
        });
        return data;
    }

    async findByEmailWithDelete(email: string) {
        return await this.usersRepository.findOne({
            where: {
                email,
            },
            withDeleted: true,
            relations: ['credential'],
        });
    }

    async findByEmail(email: string) {
        return await this.usersRepository.findOne({
            where: {
                email,
            },
            relations: ['credential'],
        });
    }

    async userInfo(id: number) {
        const data = await this.usersRepository.findOne({
            where: { id: id },
        });
        return data;
    }

    async retriveUser(email: string) {
        const user = await this.usersRepository.findOne({
            where: {
                email: email,
            },
            withDeleted: true,
            relations: ['credential'],
        });
        if(user) {
            if(user.deletedAt !== null)
            user.deletedAt = null;
            await this.usersRepository.save(user);
        };
    }

    async read(id: number) {
        return await this.usersRepository.findOne({
            where: { id: id },
            relations: ['credential'],
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        if (updateUserDto.email) {
            updateUserDto.email = updateUserDto.email.toLowerCase();
        }
        if (updateUserDto.firstName) {
            updateUserDto.firstName = updateUserDto.firstName[0].toUpperCase() + updateUserDto.firstName.slice(1);
        }
        if (updateUserDto.lastName) {
            updateUserDto.lastName = updateUserDto.lastName[0].toUpperCase() + updateUserDto.lastName.slice(1);
        }
        await this.usersRepository.update(id, updateUserDto);
        const user = await this.read(id);
        return user;
    }

    async destroy(id: number) {
        return this.usersRepository.softDelete({ id: id });
    }

    async verifyChangePassword(id: number) {
        const existingUser = await this.read(id);
        const string = otpString(4);
        existingUser.credential.changePasswwordString = string;
        await this.usersRepository.save(existingUser);
        return string;
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
        const data = await this.read(id);
        const passwordHash = await this.hashData(changePasswordDto.newPassword);
        data.credential.password = passwordHash;
        data.credential.changePasswwordString = null;
        return await this.usersRepository.save(data);

    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        forgotPasswordDto.email = forgotPasswordDto.email.toLowerCase();
        const existingUser = await this.findByEmail(forgotPasswordDto.email);
        const token = generateOTP(4);
        existingUser.credential.passwordResetOtp = token;
        existingUser.credential.passwordResetOtpExpires = new Date(
            Date.now() + 600000,
        );
        await this.usersRepository.save(existingUser);
        await this.mailService.sendPasswordResetToken(
            existingUser.email,
            existingUser.firstName,
            token,
        );
        return token;
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { email } = verifyOtpDto;
        verifyOtpDto.email = verifyOtpDto.email.toLowerCase();
        const user = await this.findByEmailWithDelete(email);
        if(user.deletedAt === null) {
            const string = (user.credential.otpString = otpString(10));
            await this.usersRepository.save(user);
            return string;
        } else {
            const string = (user.credential.otpString = otpString(10));
            user.deletedAt = null;
            user.credential.unlockOtp = null;
            user.credential.unlockOtpExpires = null;
            await this.usersRepository.save(user);
            return string
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { email, newPassword } = resetPasswordDto;
        resetPasswordDto.email = resetPasswordDto.email.toLowerCase();
        const user = await this.findByEmail(email);
        const passwordHash = await this.hashData(newPassword);
        user.credential.password = passwordHash;
        user.credential.passwordResetOtp = null;
        user.credential.passwordResetOtpExpires = null;
        user.credential.otpString = null;
        return await this.usersRepository.save(user);
    }

    async comparePasswords(Password: string, hashedPassword: string) {
        return bcrypt.compare(Password, hashedPassword);
    }

    async userTimePerDay(id: number, date: Date) {
        const sessions = await this.userSessionRepository
            .createQueryBuilder('session')
            .innerJoinAndSelect('session.user', 'user')
            .where('user.id = :userId', { userId: id })
            .andWhere('DATE(session.createdAt) = DATE(:date)', { date })
            .getMany();
        const totalMinTime = sessions.reduce((total, session) => {
            return total + session.minTime;
        }, 0);
        return totalMinTime;
    }
    
    async profilePage(id: number) {
        const user = await this.read(id);
        const totalMeditationTime = await this.userSessionRepository
            .createQueryBuilder('userSession')
            .select('SUM(userSession.minTime)', 'totalTime')
            .where('userSession.user.id = :id', { id })
            .getRawOne();
        const sessions = await this.sessionService.longestSession(id);
        const longestSession = sessions[0];
        const totalAchievement = await this.userAchievementRepository.find({
                where: {
                    user: { id: id },
                },
                relations: ['achivement']
            });
            const achivement = totalAchievement.map(totalAchievement => totalAchievement.achivement);
        return {user: user, totalMeditationTime: totalMeditationTime.totalTime, longestSession: longestSession, achievement: achivement}
    }
}
