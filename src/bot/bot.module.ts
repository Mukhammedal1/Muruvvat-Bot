import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Sahiy } from "./models/sahiy.model";
import { BotUpdate } from "./bot.update";
import { Sabrli } from "./models/sabrli.model";
import { Muruvvat } from "./models/muruvvat.model";
import { SabrliService } from "./sabrli.service";
import { SahiyService } from "./sahiy.service";

@Module({
  imports: [SequelizeModule.forFeature([Sahiy, Sabrli, Muruvvat])],
  providers: [SabrliService, SahiyService, BotUpdate, BotService],
  exports: [BotService],
})
export class BotModule {}
