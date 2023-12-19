import { ApolloDriver } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ResponseMiddleware } from './common/middlewares/response.middleware';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './subCategory/subCategory.module';
import { SessionModule } from './session/session.module';
import { PreferenceModule } from './preference/preference.module';
import { AchievementModule } from './achievement/achievement.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../'),
      renderPath: '/upload/profile/',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'appunik',
      database: 'meditation_graphql',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    } as MysqlConnectionOptions),
    UserModule,
    AuthModule,
    CategoryModule,
    SubCategoryModule,
    SessionModule,
    PreferenceModule,
    AchievementModule,
    PrivacyPolicyModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ResponseMiddleware)
      .forRoutes('graphql');
  }
}
