import { Controller, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from 'path';
import { MESSAGES } from "src/common/utils/constants";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { UserService } from "./user.service";
import { fireStorage } from "firebase-admin-config";

@Controller('upload')
export class UserImageController {
    constructor (
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        private userService: UserService
    ) {}
    
    @Post('userImage')
    @UseInterceptors(FileInterceptor('image'))
    async userImage(
        @Query('userId') id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const findUser = await this.usersRepository.findOne({where: {id: id}});
        // const client = filestack.init(filestackConfig.apiKey);
        const bucket = fireStorage;
        // const response = await client.upload(file.buffer);
        const extensions = ['.jpg', '.jpeg', '.png', '.svg', '.mp3'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!extensions.includes(fileExtension)) {
            return MESSAGES.IMAGE_FILE;
        }
        const userFolder = `users/${findUser.id}`
        const fileName = `${userFolder}user_${findUser.id}_${Date.now()}${fileExtension}`;
        const fileBuffer = file.buffer;
        await bucket.file(fileName).save(fileBuffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });
        async function getDownloadUrl(date: string): Promise<string | null> {
            const file = bucket.file(date);
            const expiration = Date.now() + (20 * 365 * 24 * 60 * 60 * 1000);
            try {
              const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: expiration,
              });
              return signedUrl;
            } catch (error) {
              console.error('Error generating signed URL:', error);
              return null;
            }
          }

        // const downloadURL = `https://storage.googleapis.com/user/${bucket.name}/${fileName}`;
        const downloadURL = await getDownloadUrl(fileName);
        await this.usersRepository.update(findUser.id, {image: downloadURL});
        const readUser = await this.userService.read(findUser.id);
        return readUser.image;
    }
}