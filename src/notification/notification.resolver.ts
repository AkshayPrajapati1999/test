import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { NotificationEntity } from './notification.entity';
import { CreateNotificationDto, PushNotificationDto, UpdateNotificationDto } from './notification.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { GraphQLError } from 'graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UpdateResult } from 'typeorm';
import { UserNotificationEntity } from './userNotification.entity';
import { query } from 'express';

@Resolver()
export class NotificationResolver {
    constructor(
        private readonly notificationsService: NotificationService,
        private readonly userService: UserService,
    ) { }

    @Mutation(() => NotificationEntity)
    async createNotification(
        @Args('createNotificationInput') createNotificationDto: CreateNotificationDto
    ) {
        try {
            const existingNotification = await this.notificationsService.findOne(createNotificationDto.name);
            if (existingNotification) {
                // return res.handler.conflict(MESSAGES.NOTIFICATION.NOTIFICATION_EXISTS);
                return new GraphQLError(MESSAGES.NOTIFICATION.NOTIFICATION_EXISTS, null);
            }
            const newNotifications = await this.notificationsService.create(createNotificationDto);
            // return res.handler.success(MESSAGES.NOTIFICATION.CREATE_SUCCESS, newNotifications);
            return newNotifications;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    // @Query(() => [NotificationEntity])
    // async findAllNotifications() {
    //     try {
    //         const notifications = await this.notificationsService.findAll();
    //         // return res.handler.success(MESSAGES.NOTIFICATION.GET_ALL_NOTIFICATION, Notifications);
    //         return notifications;
    //     } catch (error) {
    //         // return res.handler.serverError(error, error.message);
    //         return new GraphQLError(error, null);
    //     }
    // }

    @Query(() => NotificationEntity)
    async findNotification(
        @Args('notificationId') id: number
    ) {
        try {
            const data = await this.notificationsService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.NOTIFICATION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.NOTIFICATION.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.NOTIFICATION.GET_NOTIFICATION, data);
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => NotificationEntity)
    async updateNotification(
        @Args('notificationId') id: number,
        @Args('updateNotificationInput') updateNotificationDto: UpdateNotificationDto
    ) {
        try {
            const data = await this.notificationsService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.NOTIFICATION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.NOTIFICATION.NOT_FOUND, null);
            }
            const findData = await this.notificationsService.findOne(updateNotificationDto.name);
            if (findData) {
                // return res.handler.conflict(MESSAGES.NOTIFICATION.NOTIFICATION_EXISTS, null);
                return new GraphQLError(MESSAGES.NOTIFICATION.NOTIFICATION_EXISTS, null);
            }
            await this.notificationsService.read(id);
            const updatedNotification = await this.notificationsService.update(id, updateNotificationDto);
            // return res.handler.success(MESSAGES.NOTIFICATION.UPDATE_SUCCESS, updatedNotification);
            return updatedNotification;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deleteNotification(
        @Args('notificationId') id: number
    ) {
        try {
            const data = await this.notificationsService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.NOTIFICATION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.NOTIFICATION.NOT_FOUND, null);
            }

            const notification = await this.notificationsService.destroy(id);
            // return res.handler.success(MESSAGES.NOTIFICATION.DELETE_NOTIFICATION, notification);
            return MESSAGES.NOTIFICATION.DELETE_NOTIFICATION;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async userNotification(
        @Args('notificationId') id: number,
        @Args('isSubScribed') isSubScribed: boolean,
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userService.read(userId);
            const notification = await this.notificationsService.read(id);
            if (!user || !notification) {
                // return res.handler.notFound(MESSAGES.USER_NOTIFICATION_NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER_NOTIFICATION_NOT_FOUND, null);
            }
            const data = await this.notificationsService.userNotification(userId, id, isSubScribed);
            if (!(data && ((data instanceof UpdateResult && data.affected > 0) || (data instanceof UserNotificationEntity && data?.id)))) {
                // return res.handler.badRequest(MESSAGES.NOT_AFFECTED, null);
                return new GraphQLError(MESSAGES.NOT_AFFECTED, null);
            } else {
                // return res.handler.success(MESSAGES.NOTIFICATION.UPDATE_SUCCESS, data);
                return MESSAGES.NOTIFICATION.UPDATE_SUCCESS;
            }
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [UserNotificationEntity])
    @UseGuards(JwtAuthGuard)
    async getUserNotificationList(
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userService.read(userId);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER_NOTIFICATION_NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER_NOTIFICATION_NOT_FOUND, null);
            }
            const notifications = await this.notificationsService.getUserNotifications(userId);
            // return res.handler.success(MESSAGES.NOTIFICATION.GET_ALL_NOTIFICATION, Notifications);
            return notifications
        } catch (error) {
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async sendPushNotification(
        @Args('pushNotificationInput') pushNotificationDto: PushNotificationDto
    ) {
        try {
            const data = await this.notificationsService.read(pushNotificationDto.notificationId);
            if (!data) {
                // return res.handler.notFound(MESSAGES.NOTIFICATION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.NOTIFICATION.NOT_FOUND, null);
            }
            const notificationData = await this.notificationsService.sendPushNotification(pushNotificationDto);
            // return res.handler.success(MESSAGES.NOTIFICATION.NOTIFICATION_SENT, notificationData);
            return MESSAGES.NOTIFICATION.NOTIFICATION_SENT;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }
}