import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import {
    CreateSessionDto,
    SessionStopDto,
    UpdateSessionDto,
} from './session.dto';
import { SessionEntity } from './session.entity';
import { capitalizeName } from 'src/common/utils/common.utils';
import { UserSessionsEntity } from './userSession.entity';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { DescriptionService } from 'src/description.service';

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
        @InjectRepository(SessionEntity)
        private sessionRepository: Repository<SessionEntity>,
        @InjectRepository(UserSessionsEntity)
        private userSessionRepository: Repository<UserSessionsEntity>,
        private readonly subCategoryService: SubCategoryService,
        private readonly descriptionService: DescriptionService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) { }

    async create(createSessionDto: CreateSessionDto) {
        createSessionDto.name = capitalizeName(createSessionDto.name);
        const subCategory = await this.subCategoryRepository.findOne({ where: { id: createSessionDto.subCategory }, relations: ['category'] });

        const data = this.sessionRepository.create({
            ...createSessionDto,
            subCategory: subCategory,
        });

        await this.sessionRepository.save(data);
        return data;
    }

    async findAll() {
        return await this.sessionRepository.find();
    }

    async findByName(name: string) {
        return this.sessionRepository.findOne({
            where: {
                name,
            },
        });
    }

    async read(id: number) {
        return await this.sessionRepository.findOne({ where: { id: id }, relations: ['subCategory'] });

    }

    async update(id: number, updateSessionDto: UpdateSessionDto) {
        if (updateSessionDto.name) {
            updateSessionDto.name = capitalizeName(updateSessionDto.name);
        }
        await this.sessionRepository.update(id, updateSessionDto);
        const session = await this.read(id);
        return session;
    }

    async destroy(id: number) {
        await this.sessionRepository.softDelete({ id: id });
        return { deleted: true };
    }

    async stopSession(stopSession: SessionStopDto, userId: number) {
        const { minTime } = stopSession;
        const user = await this.userService.read(userId);
        const session = await this.read(stopSession.sessionId);
        const uSession = await this.userSessionRepository.findOne({
            where: {
                user: {id: userId},
                session: {id: stopSession.sessionId}
            },
        });
        if(uSession) {
            uSession.minTime = minTime;
            await this.userSessionRepository.save(uSession);
            return uSession.minTime;
        }
        const userSession = new UserSessionsEntity();
        userSession.minTime = minTime;
        userSession.session = session;
        userSession.user = user;
        await this.userSessionRepository.save(userSession);
        return userSession.minTime;
    }

    async totalTime(userId: number) {
        const sumMinTime = await this.userSessionRepository
            .createQueryBuilder('userSession')
            .select('SUM(userSession.minTime)', 'totalMinTime')
            .where('userSession.user.id = :userId', { userId })
            .getRawOne();
        const time = sumMinTime.totalMinTime;
        return time || 0;
    }

    // async longestSession(userId: number) {
    //     const totalSession = await this.userSessionRepository.find({
    //         where: {
    //             user: {id: userId},
    //         },
    //         order: {minTime: 'DESC'},
    //         take: 3,
    //         relations: ['session']
    //     });
    //     const sessions = totalSession.map(totalSession => totalSession.session);
    //     return sessions;
    // }

    async getUserTimeByWeek(userId: number) {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const userSessions = await this.userSessionRepository
        .createQueryBuilder('user_session')
        .where('user_session.user = :userId', { userId })
        .andWhere('user_session.createdAt >= :startDate', { startDate })
        .andWhere('user_session.createdAt < :endDate', { endDate: today })
        .getMany();
        const meditationTimeByDay = userSessions.reduce((acc, session) => {
            const sessionDate = session.createdAt.toISOString().split('T')[0];
            acc[sessionDate] = (acc[sessionDate] || 0) + session.minTime;
            return acc;
          }, {});

        const totalMeditationTimeWeek = userSessions.reduce((total, session) => {
            return total + session.minTime;
          }, 0);

        const userOverallTime = userSessions.reduce((acc, session) => acc + session.minTime, 0);

        const dateArray = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dateArray.push(date);
          }
      
          const result = dateArray.map(date => ({
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            date: date.toISOString().split('T')[0],
            totalMeditationTime: meditationTimeByDay[date.toISOString().split('T')[0]] || 0,
          }));
        return {result: result.reverse(),
            totalMeditationTimeWeek,
            userOverallTime,
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };
    }

    async longestSession(userId: number) {
        const subCategories = await this.subCategoryRepository.find();

        const longestSessionsBySubCategory = await Promise.all(
            subCategories.map(async (subCategory) => {
              const sessions = await this.subCategoryService.sessionList(userId, subCategory.id);
              const totalMinTime = sessions.sessionList.reduce((total, session) => total + session.minTime, 0);
              const allSessions = await this.subCategoryService.sessionList(userId, subCategory.id);
              return {
                subCategory,
                totalMinTime,
                sessions: allSessions.sessionList,
              };
            }),
          );

          const sortedLongestSessions = longestSessionsBySubCategory.sort((a, b) => b.totalMinTime - a.totalMinTime);
          const firstThreeLongestSessions = sortedLongestSessions.slice(0, 3);
          const descriptions = firstThreeLongestSessions.map((_, index) =>
      this.descriptionService.getLongestSessionDescription(index + 1),
    );

    const longestSessionsWithDescriptions = firstThreeLongestSessions.map((session, index) => ({
      ...session,
      description: descriptions[index],
    }));
          return longestSessionsWithDescriptions;
    }
}
