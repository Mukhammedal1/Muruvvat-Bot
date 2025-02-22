import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sahiy } from "./models/sahiy.model";
import { Context, Markup } from "telegraf";

@Injectable()
export class SahiyService {
  constructor(@InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy) {}

  async registerSahiy(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const sahiy = await this.sahiyModel.findByPk(user_id);
      if (!sahiy) {
        await this.sahiyModel.create({
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
      console.log("registerSahiyda error", error);
    }
  }

  async onLocation(ctx: Context) {
    try {
      if ("location" in ctx.message!) {
        const user_id = ctx.from?.id;
        const sahiy = await this.sahiyModel.findByPk(user_id);
        if (!sahiy || !sahiy.is_active) {
          await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["/start"]])
              .resize()
              .oneTime(),
          });
        } else if (sahiy && sahiy!.last_state == "location") {
          sahiy!.location = `${ctx.message.location.latitude}, ${ctx.message.location.longitude}`;
          sahiy!.last_state = "finish";
          await sahiy.save();

          await ctx.reply(`Xush kelibsiz`, {
            parse_mode: "HTML",
            ...Markup.keyboard([
              ["Muruvvat qilish", "Sabrlilarni ko'rish"],
              ["Sozlamalar", "Asosiy menyu"],
              ["Admin bilan bo'glanish"],
            ])
              .resize()
              .oneTime(),
          });
        }
      }
    } catch (error) {
      console.log("OnLocationda error", error);
    }
  }
}
