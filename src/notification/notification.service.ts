import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { admin } from 'firebase-admin-config';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import {
    CreateNotificationDto,
    PushNotificationDto,
    UpdateNotificationDto,
} from './notification.dto';
import { NotificationEntity } from './notification.entity';
// import { PushNotificationLog } from './push-notification.entity';
// import { UserNotificationEntity } from './user-notification.entity';
import { capitalizeName } from 'src/common/utils/common.utils';
import { UserNotificationEntity } from './userNotification.entity';
import { PushNotificationLog } from './pushNotification.entity';
import { GraphQLError } from 'graphql';
import { MESSAGES } from 'src/common/utils/constants';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(UserNotificationEntity)
        private userNotificationRepository: Repository<UserNotificationEntity>,
        @InjectRepository(PushNotificationLog)
        private pushNotificationLogRepository: Repository<PushNotificationLog>,
        @InjectRepository(NotificationEntity)
        private notificationsRepository: Repository<NotificationEntity>,
        @InjectRepository(UserCredentials)
        private usersCredentials: Repository<UserCredentials>,
        private readonly userservice: UserService,
    ) { }

    async create(createNotificationDto: CreateNotificationDto) {
        createNotificationDto.name = capitalizeName(createNotificationDto.name);
        const data = this.notificationsRepository.create({
            ...createNotificationDto,
        });

        await this.notificationsRepository.save(data);
        return data;
    }

    async findAll() {
        return await this.notificationsRepository.find();
    }

    async findOne(name: string) {
        return this.notificationsRepository.findOne({
            where: {
                name,
            },
        });
    }

    async read(id: number) {
        return await this.notificationsRepository.findOne({ where: { id: id } });
    }

    async update(id: number, updateNotificationDto: UpdateNotificationDto) {
        if (updateNotificationDto.name) {
            updateNotificationDto.name = capitalizeName(updateNotificationDto.name);
        }
        await this.notificationsRepository.update(id, updateNotificationDto);
        const notification = await this.read(id);
        return notification;
    }

    async destroy(id: number) {
        await this.notificationsRepository.softDelete({ id: id });
        return { deleted: true };
    }

    async userNotification(
        userId: number,
        notificationId: number,
        isSubscribed: boolean,
    ) {
        const user = await this.userservice.read(userId);
        const notification = await this.read(notificationId);
        let userNotificationData = await this.userNotificationRepository.findOne({
            where: {
                user: { id: userId },
                notification: { id: notificationId },
            },
        });
        if (!userNotificationData) {
            userNotificationData = new UserNotificationEntity();
            userNotificationData.user = user;
            userNotificationData.notification = notification;
            userNotificationData.is_sub_flag = isSubscribed;
            return await this.userNotificationRepository.save(userNotificationData);
        }
        return await this.userNotificationRepository.update(userNotificationData.id, { is_sub_flag: isSubscribed });
    }

    async getUserNotifications(userId: number) {
        const user = await this.userservice.read(userId);
        const allNotifications = await this.findAll();
        const userNotifications = await this.userNotificationRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['notification'],
        });
        const notificationMap = new Map<number, UserNotificationEntity>();
        userNotifications.forEach((up) => notificationMap.set(up.notification.id, up));
        const userNotificationsToReturn: UserNotificationEntity[] = [];

        for (const notification of allNotifications) {
            const userNotification = notificationMap.get(notification.id);

            if (!userNotification) {
                const newUserNotification = new UserNotificationEntity();
                newUserNotification.user = user;
                newUserNotification.notification = notification;
                newUserNotification.is_sub_flag = false;
                userNotificationsToReturn.push(await this.userNotificationRepository.save(newUserNotification));
            } else {
                userNotification.is_sub_flag = userNotification.is_sub_flag;
                userNotificationsToReturn.push(await this.userNotificationRepository.save(userNotification));
            }
        }
        return userNotificationsToReturn;
    }

    async sendPushNotification(pushNotificationDto: PushNotificationDto) {
        const { title, body, extraData } = pushNotificationDto;
        const message = {
            notification: {
                title,
                body,
                extraData,
            },
            notificationId: pushNotificationDto.notificationId,
        };

        const notifications = await this.userNotificationRepository
            .createQueryBuilder('user_notification')
            .leftJoinAndSelect('user_notification.user', 'user')
            .where('user_notification.notificationId = :notificationId', {
                notificationId: message.notificationId,
            })
            .andWhere('user_notification.is_sub_flag = :isSubFlag', {
                isSubFlag: true,
            })
            .getMany();

        for (const notification of notifications) {
            if (notification.user) {
                const userId = notification.user.id;
                const device = await this.usersCredentials.findOne({
                    where: {
                        id: userId,
                    },
                });

                if (device && device.deviceToken) {
                    const deviceToken = device.deviceToken;
                    if (!deviceToken) {
                        return new GraphQLError(MESSAGES.NOTIFICATION.DEVICE_TOKEN_NOT_FOUND, null);
                    }
                    const pushMessage = {
                        notification: {
                            title,
                            body,
                        },
                        data: {
                            extraData
                        },
                        token: deviceToken,
                    };
                    try {
                        await admin.messaging().send(pushMessage);
                        const logEntry = new PushNotificationLog();
                        logEntry.title = title;
                        logEntry.body = body;
                        logEntry.extraData = extraData;
                        logEntry.user = notification.user;
                        logEntry.sentAt = new Date();
                        await this.pushNotificationLogRepository.save(logEntry);
                    } catch (error) {
                        console.log(error);
                        return new GraphQLError(MESSAGES.NOTIFICATION.NOT_SEND, null);
                    }
                }
            }
        }

        if (!notifications) {
            throw new HttpException(
                MESSAGES.NOTIFICATION.NOT_FOUND,
                HttpStatus.CONFLICT,
            );
        }
    }
}
