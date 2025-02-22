import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { Sahiy } from "./models/sahiy.model";
import { Sabrli } from "./models/sabrli.model";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectBot(process.env.BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async onstart(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const chanel_info = await this.bot.telegram.getChat("@yaxshilik_qi1");
      const chanel_id = chanel_info.id;
      const chatMember = await this.bot.telegram.getChatMember(
        chanel_id,
        user_id!
      );
      if (chatMember.status === "left") {
        return ctx.reply(
          "🚀 Botdan foydalanish uchun quyidagi kanalga a'zo bo'ling",
          Markup.inlineKeyboard([
            [
              Markup.button.url(
                "📢 Kanalga a'zo bo'lish",
                "https://t.me/yaxshilik_qi1"
              ),
            ],
            [Markup.button.callback("✅ Tekshirish", "check_sub")],
          ])
        );
      } else {
        const sabrli = await this.sabrliModel.findByPk(user_id);
        const sahiy = await this.sahiyModel.findByPk(user_id);
        if (sahiy && sahiy.is_active) {
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
        } else if (sabrli && sabrli.is_active) {
          await ctx.reply(`Xush kelibsiz`, {
            parse_mode: "HTML",
            ...Markup.keyboard([
              ["Murojat yo'llash"],
              ["Asosiy menyu", "Sozlamalar"],
              ["Admin bilan bog'lanish"],
            ])
              .resize()
              .oneTime(),
          });
        } else if (user_id == process.env.ADMIN) {
          await ctx.reply("Xush kelibsiz Admin", {
            parse_mode: "HTML",
            ...Markup.keyboard([["Sahiylar", "Sabrlilar"]])
              .oneTime()
              .resize(),
          });
        } else {
          await ctx.reply(
            `Xush kelibsiz, botdan kim sifatida foydalanmoqchisiz`,
            {
              parse_mode: "HTML",
              ...Markup.keyboard([["Sahiy", "Sabrli"]])
                .resize()
                .oneTime(),
            }
          );
        }
      }
    } catch (error) {
      console.log("onStartda xatolik", error);
    }
  }

  async admin_menu(ctx: Context) {
    try {
      await ctx.reply("Xush kelibsiz Admin", {
        parse_mode: "HTML",
        ...Markup.keyboard([["Sabrlilar", "Sahiylar"]])
          .oneTime()
          .resize(),
      });
    } catch (error) {
      console.log("Admin menyusida xatolik", error);
    }
  }

  async onContact(ctx: Context) {
    if ("contact" in ctx.message!) {
      const user_id = ctx.from?.id;
      const sahiy = await this.sahiyModel.findByPk(user_id);
      const sabrli = await this.sabrliModel.findByPk(user_id);
      if (!sahiy && !sabrli) {
        await ctx.reply(`Iltimos, <b>Start</b> tugmasini bosing`, {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .resize()
            .oneTime(),
        });
      } else if (ctx.message!.contact.user_id != user_id) {
        await ctx.reply(`Iltimos, o'zingizni telefon raqamingizni yuboring`, {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.contactRequest("Telefon raqamni yuborish")],
          ])
            .resize()
            .oneTime(),
        });
      } else if (sahiy && sahiy.last_state == "phone") {
        sahiy.phone_number = ctx.message.contact.phone_number;
        sahiy.is_active = true;
        sahiy.last_state = "location";
        await sahiy.save();
        await ctx.reply(
          "Akkauntingiz faollashtirildi. Iltimos joylashuvingizni yuboring",
          {
            parse_mode: "HTML",
            ...Markup.keyboard([
              [Markup.button.locationRequest("Joylashuvni yuborish")],
            ])
              .resize()
              .oneTime(),
          }
        );
      } else if (sabrli) {
        sabrli.phone_number = ctx.message.contact.phone_number;
        sabrli.is_active = true;
        sabrli.last_state = "region";
        await sabrli.save();
        await ctx.reply(
          `Akkauntingiz faollashtirildi. Iltimos, viloyatingiz nomini kiriting`,
          {
            parse_mode: "HTML",
            ...Markup.removeKeyboard(),
          }
        );
      }
    }
  }

  async checkSubscribeChanel(ctx: Context) {
    const user_id = ctx.from?.id;
    const chanel_info = await this.bot.telegram.getChat("@yaxshilik_qi1");
    const chanel_id = chanel_info.id;
    try {
      const chatMember = await this.bot.telegram.getChatMember(
        chanel_id,
        user_id!
      );
      if (chatMember.status === "left") {
        return ctx.reply("❌ Kanalga a'zo bo'lmadingiz!");
      }
      await ctx.reply(`Botdan kim sifatida foydalanmoqchisiz`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["Sahiy", "Sabrli"]])
          .resize()
          .oneTime(),
      });
    } catch (error) {
      console.log("Ontextda error", error);
    }
  }

  async onText(ctx: Context) {
    try {
      if ("text" in ctx.message!) {
        const user_id = ctx.from?.id;
        const sahiy = await this.sahiyModel.findByPk(user_id);
        const sabrli = await this.sabrliModel.findByPk(user_id);
        if (sahiy) {
          if (sahiy.last_state !== "finish") {
            if (sahiy.last_state == "name") {
              sahiy.name = ctx.message.text;
              sahiy.last_state = "phone";
              await sahiy.save();
              await ctx.reply(
                `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
                {
                  parse_mode: "HTML",
                  ...Markup.keyboard([
                    [Markup.button.contactRequest("Telefon raqamni yuborish")],
                  ])
                    .resize()
                    .oneTime(),
                }
              );
            }
          }
        } else if (sabrli) {
          if (sabrli.last_state !== "finish") {
            if (sabrli.last_state == "name") {
              sabrli.name = ctx.message.text;
              sabrli.last_state = "phone";
              await sabrli.save();
              await ctx.reply(
                `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
                {
                  parse_mode: "HTML",
                  ...Markup.keyboard([
                    [Markup.button.contactRequest("Telefon raqamni yuborish")],
                  ])
                    .resize()
                    .oneTime(),
                }
              );
            } else if (sabrli.last_state == "region") {
              sabrli.region = ctx.message.text;
              sabrli.last_state = "district";
              await sabrli.save();
              await ctx.reply(`Tuman yoki shahar nomini kiriting`, {
                parse_mode: "HTML",
                ...Markup.removeKeyboard(),
              });
            } else if (sabrli.last_state == "district") {
              sabrli.district = ctx.message.text;
              sabrli.last_state = "finish";
              await sabrli.save();
              await ctx.reply(`Xush kelibsiz`, {
                parse_mode: "HTML",
                ...Markup.keyboard([
                  ["Murojat yo'llash"],
                  ["Asosiy menyu", "Sozlamalar"],
                  ["Admin bilan bog'lanish"],
                ])
                  .resize()
                  .oneTime(),
              });
            }
          }
        } else {
          await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["/start"]])
              .resize()
              .oneTime(),
          });
        }
      }
    } catch (error) {
      console.log("Ontextda error", error);
    }
  }
}
