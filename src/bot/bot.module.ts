import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./models/user.model";
import { BotUpdate } from "./bot.update";
import { Master } from "./models/master.model";
import { MasterUpdate } from "./master.update";
import { MasterService } from "./master.service";
import { UsersUpdate } from "./users.update";
import { UsersService } from "./users.service";
import { BronTime } from "./models/bron_time.model";
import { Service } from "./models/services.model";

@Module({
  imports: [SequelizeModule.forFeature([User, Master,BronTime,Service])],
  providers: [
    MasterUpdate,
    MasterService,
    UsersUpdate,
    UsersService,
    BotUpdate,
    BotService,
  ],
  exports:[BotService]
})
export class BotModule {}
