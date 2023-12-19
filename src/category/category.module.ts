import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { CategoryImageController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, SubCategoryEntity])],
  providers: [CategoryService, CategoryResolver],
  controllers: [CategoryImageController],
  exports: [CategoryService]
})
export class CategoryModule { }
