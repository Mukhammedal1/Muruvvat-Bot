import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { TelegrafModule } from "nestjs-telegraf";
import { Sahiy } from "./bot/models/sahiy.model";
import { BotModule } from "./bot/bot.module";
import { Sabrli } from "./bot/models/sabrli.model";

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName: process.env.BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN || "12345",
        middlewares: [],
        include: [BotModule],
      }),
    }),
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      username: process.env.POSTGRES_USER,
      port: Number(process.env.POSTGRES_PORT),
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Sabrli, Sahiy],
      autoLoadModels: true,
      sync: { alter: true },
      logging: false,
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
