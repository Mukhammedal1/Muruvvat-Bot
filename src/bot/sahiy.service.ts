import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sahiy } from "./models/sahiy.model";
import { Context, Markup } from "telegraf";
import { Muruvvat } from "./models/muruvvat.model";
import { Sabrli } from "./models/sabrli.model";
import { Murojat } from "./models/murojat.model";

@Injectable()
export class SahiyService {
  constructor(
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectModel(Murojat) private readonly murojatModel: typeof Murojat,
    @InjectModel(Muruvvat) private readonly muruvvatModel: typeof Muruvvat
  ) {}

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

  async onclickMuruvvatQilish(ctx: Context) {
    const sahiy_id = ctx.from?.id;
    const sahiy = await this.sahiyModel.findByPk(sahiy_id);
    if (sahiy) {
      await ctx.reply("Kimga: ", {
        ...Markup.removeKeyboard(),
      });
      const muruvvat = await this.muruvvatModel.create({
        sahiy_id,
        last_state: "kimga",
      });
    }
  }
  async onclickShowSabrli(ctx: Context) {
    await ctx.reply("Quyidagilardan birini tanlang", {
      ...Markup.keyboard([
        ["Barcha sabrlilar", "Hudud bo'yicha"],
        ["Yoshi va jinsi bo'yicha", "Jinsi va o'lchami bo'yicha"],
        ["Ortga qaytish"],
      ])
        .resize()
        .oneTime(),
    });
  }

  async onclickAllSabrli(ctx: Context) {
    const sabrlilar = await this.murojatModel.findAll();
    for (const sabrli of sabrlilar) {
      const sabrli2 = await this.sabrliModel.findOne({
        where: { id: sabrli.sabrli_id },
      });
      await ctx.reply(
        `Ism: ${sabrli2!.name}\nTelefon raqam: ${sabrli2!.phone_number}\nJinsi: ${sabrli.gender}\Yoshi: ${sabrli.age}\nO'lchami: ${sabrli.size}\nNima kerak: ${sabrli.item}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Muruvvat qilish",
                  callback_data: `sabrli_${sabrli.id}`,
                },
              ],
            ],
          },
        }
      );
    }
  }

  async onclickSeeSabrli(ctx: Context) {
    const sahiy_id = ctx.from?.id;
    const murojatlar = await this.murojatModel.findAll();
    if (murojatlar) {
      for (const murojat of murojatlar) {
        const sabrli = await this.sabrliModel.findOne({
          where: { id: murojat.sabrli_id },
        });
        if (sabrli) {
          await ctx.replyWithPhoto(`${murojat.image}`, {
            caption: `Ism: ${sabrli.name}\nJinsi: ${murojat.gender}\nYoshi: ${murojat.age} yosh\nO'lchami: ${murojat.size}\nNima kerak: ${murojat.item}`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🤲 Muravvat qilish",
                    callback_data: `donate_${sabrli!.id}`,
                  },
                ],
              ],
            },
          });
        }
      }
    }
  }
}
