import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { Sahiy } from "./models/sahiy.model";
import { Sabrli } from "./models/sabrli.model";
import { Muruvvat } from "./models/muruvvat.model";
import { Murojat } from "./models/murojat.model";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectModel(Muruvvat) private readonly muruvvatModel: typeof Muruvvat,
    @InjectModel(Murojat) private readonly murojatModel: typeof Murojat,
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
          } else if (sahiy.last_state == "finish") {
            const muruvvat1 = await this.muruvvatModel.findOne({
              where: { sahiy_id: user_id, last_state: "kimga" },
            });
            if (muruvvat1) {
              muruvvat1.who_for = ctx.message.text;
              muruvvat1.last_state = "nima";
              await muruvvat1.save();
              await ctx.reply("Nima:", {
                ...Markup.removeKeyboard(),
              });
              return
            }
            const muruvvat2 = await this.muruvvatModel.findOne({
              where: { sahiy_id: user_id, last_state: "nima" },
            });
            if (muruvvat2) {
              muruvvat2.item = ctx.message.text;
              muruvvat2.last_state = "finish";
              await muruvvat2.save();
              await ctx.reply("Kiritgan ma'lumotlaringiz adminga yuborildi", {
                ...Markup.removeKeyboard(),
              });
              const message = `📢 Sahiydan muruvvat uchun malumotlar yuborildi\n👤 Ism: ${sahiy.name}\n📞 Telefon raqam: ${sahiy.phone_number}\n👉👤 Kimga: ${muruvvat2.who_for}\n🎁 Nima: ${muruvvat2.item}`;
              const admin = Number(process.env.ADMIN);
              await ctx.telegram.sendMessage(admin, message);
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
          } else if (sabrli.last_state == "finish") {
            const murojat = await this.murojatModel.findOne({
              where: { sabrli_id: user_id, last_state: "item" },
            });
            if (murojat) {
              murojat.item = ctx.message.text;
              murojat.last_state = "age";
              await murojat.save();
              await ctx.reply("Yoshingizni kiriting masalan(25)");
            }
            const murojat2 = await this.murojatModel.findOne({
              where: { sabrli_id: user_id, last_state: "age" },
            });
            if (murojat2) {
              murojat2.age = Number(ctx.message.text);
              murojat2.last_state = "gender";
              await murojat2.save();
              await ctx.reply(`Jinsingizni tasdiqlang`, {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "👨 Erkak ",
                        callback_data: `male_${murojat2.sabrli_id}`,
                      },
                      {
                        text: "👩 Ayol",
                        callback_data: `female_${murojat2.sabrli_id}`,
                      },
                    ],
                  ],
                },
              });
            }
            const murojat3 = await this.murojatModel.findOne({
              where: { sabrli_id: user_id, last_state: "height" },
            });
            if (murojat3) {
              murojat3.height = Number(ctx.message.text);
              murojat3.last_state = "size";
              await murojat3.save();
              await ctx.reply(
                "O'lchamingizni kiriting masalan(M,L,XL yoki oyoq kiyim: 41,39)"
              );
              return
            }
            const murojat4 = await this.murojatModel.findOne({
              where: { sabrli_id: user_id, last_state: "size" },
            });
            if (murojat4) {
              murojat4.size = ctx.message.text;
              murojat4.last_state = "finish";
              await murojat4.save();
              await ctx.reply("Malumotlaringiz saqlandi");
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
