import { Injectable } from "@nestjs/common";
import { CreateMasterDto } from "./dto/create-master.dto";
import { UpdateMasterDto } from "./dto/update-master.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Sabrli } from "./models/sabrli.model";
import { Context, Markup } from "telegraf";
import { Sahiy } from "./models/sahiy.model";
import { callback } from "telegraf/typings/button";

@Injectable()
export class SabrliService {
  constructor(
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy
  ) {}

  async registerSabrli(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const sabrli = await this.sabrliModel.findByPk(user_id);
      if (!sabrli) {
        await this.sabrliModel.create({
          id: user_id,
          username: ctx.from?.username,
          lang: ctx.from?.language_code,
          last_state: "name",
        });
        await ctx.reply(`Iltimos, Ismingizni kiriting`, {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
        });
      }
    } catch (error) {
      console.log("registerSabrlida error", error);
    }
  }
}
