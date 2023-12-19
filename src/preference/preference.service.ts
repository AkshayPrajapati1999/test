import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreatePreferenceDto, UpdatePreferenceDto } from './preference.dto';
import { capitalizeName } from 'src/common/utils/common.utils';
import { PreferencesEntity } from './preference.entity';
import { UserPreferencesEntity } from './userPreference.entity';

@Injectable()
export class PreferencesService {
    constructor(
        @InjectRepository(PreferencesEntity)
        private preferencesRepository: Repository<PreferencesEntity>,
        @InjectRepository(UserPreferencesEntity)
        private userPreferencesRepository: Repository<UserPreferencesEntity>,
        private readonly userService: UserService,
    ) { }

    async create(createPreferenceDto: CreatePreferenceDto) {
        createPreferenceDto.name = capitalizeName(createPreferenceDto.name);
        const data = this.preferencesRepository.create({
            ...createPreferenceDto,
        });

        await this.preferencesRepository.save(data);
        return data;
    }

    async findAll() {
        const preferences = await this.preferencesRepository.find({
            relations: ['userPreferences'],
        });

        return preferences;
    }

    async findOne(name: string) {
        return this.preferencesRepository.findOne({
            where: {
                name,
            },
        });
    }

    async read(id: number) {
        return await this.preferencesRepository.findOne({ where: { id: id } });
    }

    async update(id: number, updatePreferencesDto: UpdatePreferenceDto) {
        if (updatePreferencesDto.name) {
            updatePreferencesDto.name = capitalizeName(updatePreferencesDto.name);
        }
        await this.preferencesRepository.update(id, updatePreferencesDto);
        const preference = await this.read(id);
        return preference;
    }

    async destroy(id: number) {
        await this.preferencesRepository.softDelete({ id: id });
        return { deleted: true };
    }

    async userPreferences(id: number, preferencesId: number, flag: boolean) {
        const user = await this.userService.read(id);
        const preference = await this.read(preferencesId);
        let userPreferences = await this.userPreferencesRepository.findOne({
            where: {
                user: { id: id },
                preferences: { id: preferencesId },
            },
        });
        if (!userPreferences) {
            const newUserPreferences = new UserPreferencesEntity();
            newUserPreferences.user = user;
            newUserPreferences.preferences = preference;
            newUserPreferences.is_flag = flag;
            return await this.userPreferencesRepository.save(newUserPreferences);
        }
        return await this.userPreferencesRepository.update(userPreferences.id, {
            is_flag: flag,
        });
    }

    async getUserPreferences(userId: number) {
        const user = await this.userService.read(userId);
        const allPreferences = await this.findAll();
        const userPreferences = await this.userPreferencesRepository.find({
            where: { user: { id: userId } },
            relations: ['preferences'],
        });
        const preferencesMap = new Map<number, UserPreferencesEntity>();
        userPreferences.forEach((up) => preferencesMap.set(up.preferences.id, up));
        const userPreferencesToReturn: UserPreferencesEntity[] = [];

        for (const preference of allPreferences) {
            const userPreference = preferencesMap.get(preference.id);

            if (!userPreference) {
                const newUserPreference = new UserPreferencesEntity();
                newUserPreference.user = user;
                newUserPreference.preferences = preference;
                newUserPreference.is_flag = false;
                userPreferencesToReturn.push(await this.userPreferencesRepository.save(newUserPreference));
            } else {
                userPreference.is_flag = userPreference.is_flag;
                userPreferencesToReturn.push(await this.userPreferencesRepository.save(userPreference));
            }
        }
        return userPreferencesToReturn;
    }
}
