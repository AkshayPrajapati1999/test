import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { AchievementsEntity } from './achievement.entity';
import {
    CreateAchievementsDto,
    UpdateAchievementsDto,
} from './achievement.dto';
import { capitalizeName } from 'src/common/utils/common.utils';
import { UserAchievementsEntity } from './userAchievement.entity';

@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserAchievementsEntity)
        private userAchievementRepository: Repository<UserAchievementsEntity>,
        @InjectRepository(AchievementsEntity)
        private achievementsRepository: Repository<AchievementsEntity>
    ) { }

    async create(createAchievementsDto: CreateAchievementsDto) {
        createAchievementsDto.name = capitalizeName(createAchievementsDto.name);
        const data = this.achievementsRepository.create({
            ...createAchievementsDto,
        });

        await this.achievementsRepository.save(data);
        return data;
    }

    async findAll() {
        return await this.achievementsRepository.find();
    }

    async findOne(name: string) {
        return this.achievementsRepository.findOne({
            where: {
                name,
            },
        });
    }

    async read(id: number) {
        return await this.achievementsRepository.findOne({ where: { id: id } });
    }

    async update(id: number, updateAchievementsDto: UpdateAchievementsDto) {
        if (updateAchievementsDto.name) {
            updateAchievementsDto.name = capitalizeName(updateAchievementsDto.name);
        }
        await this.achievementsRepository.update(id, updateAchievementsDto);
        const achievement = await this.read(id);
        return achievement;
    }

    async destroy(id: number) {
        await this.achievementsRepository.softDelete({ id: id });
        return { deleted: true };
    }

    async userAchievement(userId: number, achievementId: number) {
        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
            },
        });
        const achievement = await this.achievementsRepository.findOne({
            where: { id: achievementId },
        });
        const userAchievement = new UserAchievementsEntity();
        userAchievement.user = user;
        userAchievement.achivement = achievement;
        await this.userAchievementRepository.save(userAchievement);
        return userAchievement;
    }

    async userAchievementList(userId: number) {
        const achievement = await this.userAchievementRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['achivement']
        });
        return achievement.map(achieve => achieve.achivement);
    }

    async achievementDesctiption(userId: number, achievementId: number) {
        const userAchievement = await this.userAchievementRepository.find({
            where: {
                achivement: { id: achievementId },
                user: { id: userId },
            },
            relations: ['achivement']
        });
        if (userAchievement) {
            const achievement = await this.read(achievementId);
            return {
                achievement,
                description: `${achievement.name} obtained successfully`
            };
        } else {
            return 'Achievement not found or not obtained';
        }
    }
}
