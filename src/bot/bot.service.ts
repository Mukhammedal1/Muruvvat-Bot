import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { User } from "./models/user.model";
import { text } from "stream/consumers";
import { Master } from "./models/master.model";
import { Op } from "sequelize";
import { Service } from "./models/services.model";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(Service) private readonly serviceModel: typeof Service,
    @InjectBot(process.env.BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async admin_menu(ctx: Context, menu_text = `<b>Admin menyusi</b>`) {
    try {
      await ctx.reply(menu_text, {
        parse_mode: "HTML",
        ...Markup.keyboard([["🛠 Xizmatlar", "👥 Mijozlar", "🧑‍🔧 Ustalar"]])
          .oneTime()
          .resize(),
      });
    } catch (error) {
      console.log("Admin menyusida xatolik", error);
    }
  }

  async adminServices(ctx: Context) {
    try {
      await ctx.reply("Quyidagilardan birini tanlang", {
        parse_mode: "HTML",
        ...Markup.keyboard([
          ["➕ Xizmat qo'shish"],
          ["✏️ Xizmatni tahrirlash"],
          ["🗑 Xizmatni o'chirish"],
        ])
          .oneTime()
          .resize(),
      });
    } catch (error) {
      console.log("Admin menyusida xatolik", error);
    }
  }

  async addService(ctx: Context) {
    try {
      await ctx.reply("Xizmat nomini kiriting", {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
      });
    } catch (error) {
      console.log("Admin menyusida xatolik", error);
    }
  }

  async onVerifyMaster(ctx: Context) {
    try {
      const master_id = ctx.from!.id;
      const master = await this.masterModel.findByPk(master_id);
      if (!master) {
        return ctx.reply("Usta topilmadi! ❌");
      }
      const admin = Number(process.env.ADMIN);
      const message = `📢 Yangi usta malumotlari tasdiqlash uchun jo'natildi!\n👤 Ism: ${master.first_name}\n🔰 Username: @${master.username}\n🆔 ID: ${master.id}\n🏢 Ustaxona nomi: ${master.workshop_name}\n📍 Manzil: ${master.address}\n📌 Mo'ljal: ${master.address_target}\n🕘 Ish boshlash vaqti: ${master.start_time}:00\n🕖 Ish tugash vaqti: ${master.end_time}:00\n⏳ Har bir mijozga ajratilgan vaqt: ${master.average_service_time} daqiqa\n📞 Telefon raqam: ${master.phone_number}`;

      await ctx.telegram.sendMessage(
        admin,
        message,
        Markup.inlineKeyboard([
          [Markup.button.callback("✅ Tasdiqlash", `yes_${master_id}`)],
          [Markup.button.callback("❌ Rad etish", `no_${master_id}`)],
        ])
      );
      await ctx.reply(
        `🔄 Ma'lumotlaringiz adminga yuborildi. Tasdiqlashni tekshirish uchun <b>✅ Tekshirish</b> tugmasini bosing`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            ["✅ Tekshirish", "❌ Bekor qilish"],
            ["Admin bilan bog'lanish"],
          ])
            .resize()
            .oneTime(),
        }
      );
    } catch (error) {
      console.log(`onVerifyMaster da xatolik`, error);
    }
  }

  async onVerifyCancel(ctx: Context) {
    try {
      const master_id = ctx.from?.id;
      const master = await this.masterModel.destroy({
        where: { id: master_id },
      });
      if (master) {
        await ctx.replyWithHTML("Malumotlaringiz bekor qilindi", {
          parse_mode: "HTML",
          ...Markup.keyboard([["Ro'yxatdan o'tish"]])
            .resize()
            .oneTime(),
        });
      }
    } catch (error) {}
  }

  async verifyResultYes(ctx: Context) {
    try {
      const master_id = ctx.callbackQuery!["data"].split("_")[1];
      const master = await this.masterModel.findByPk(master_id);

      if (!master) {
        return ctx.reply("Usta topilmadi! ❌");
      }

      master.is_verified = true;
      await master.save();
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: "✅ Tasdiqlandi", callback_data: "confirmed" }],
        ],
      });
    } catch (error) {
      console.log(`verifyMasterda xatolik`, error);
    }
  }

  async verifyResultNo(ctx: Context) {
    try {
      const master_id = ctx.callbackQuery!["data"].split("_")[1];
      const master = await this.masterModel.findByPk(master_id);

      if (!master) {
        await ctx.reply("Usta topilmadi! ❌");
      } else {
        const master = await this.masterModel.destroy({
          where: { id: master_id },
        });
        await ctx.editMessageReplyMarkup({
          inline_keyboard: [
            [{ text: "❌ Bekor qilindi", callback_data: "no_confirmed" }],
          ],
        });
      }
    } catch (error) {
      console.log(`verifyMasterda xatolik`, error);
    }
  }

  async start(ctx: Context) {
    const user_id = ctx.from?.id;
    const user = await this.userModel.findByPk(user_id);
    const master = await this.masterModel.findByPk(user_id);

    if (master) {
      await ctx.reply(`Xush kelibsiz`, {
        parse_mode: "HTML",
        ...Markup.keyboard([
          ["👤 Mijozlar", "🕜 Vaqt", "⭐️ Reyting"],
          ["✏️ Malumotlarni o'zgartirish"],
        ])
          .resize()
          .oneTime(),
      });
    } else if (user) {
      await ctx.reply(`Xush kelibsiz`, {
        parse_mode: "HTML",
        ...Markup.keyboard([
          ["Xizmatlar"],
          ["Tanlangan xizmatlar"],
          ["Ma'lumotlarni o'zgartirish"],
        ])
          .resize()
          .oneTime(),
      });
    } else if (user_id == process.env.ADMIN) {
      await ctx.reply("Xush kelibsiz", {
        parse_mode: "HTML",
        ...Markup.keyboard([["🛠 Xizmatlar", "👥 Mijozlar", "🧑‍🔧 Ustalar"]])
          .oneTime()
          .resize(),
      });
    } else {
      await ctx.reply(
        `Botdan foydalanish uchun, <b>Ro'yxatdan o'tish</b> tugmasini bosing`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([["Ro'yxatdan o'tish"]])
            .resize()
            .oneTime(),
        }
      );
    }
  }

  async register(ctx: Context) {
    await ctx.reply(`Siz kim sifatida ro'yxatdan o'tmoqchisiz`, {
      parse_mode: "HTML",
      ...Markup.keyboard([["👤 Mijoz", "👨‍🔧 Usta"]])
        .resize()
        .oneTime(),
    });
  }

  async masterRegister(ctx: Context) {
    try {
      const master_id = ctx.from?.id;
      const master = await this.masterModel.findByPk(master_id);
      if (!master) {
        await this.masterModel.create({
          id: master_id,
          username: ctx.from?.username,
          first_name: ctx.from?.first_name,
          lang: ctx.from?.language_code,
        });
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
      } else if (!master.is_active) {
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
    } catch (error) {
      console.log("masterRegister error", error);
    }
  }

  async onContact(ctx: Context) {
    if ("contact" in ctx.message!) {
      const user_id = ctx.from?.id;
      const user = await this.userModel.findByPk(user_id);
      const master = await this.masterModel.findByPk(user_id);
      if (!user && !master) {
        await ctx.reply(
          `Iltimos, <b>Ro'yxatdan o'tish tugmasini bosing</b> tugmasini bosing`,
          {
            parse_mode: "HTML",
            ...Markup.keyboard([["Ro'yxatdan o'tish"]])
              .resize()
              .oneTime(),
          }
        );
      } else if (ctx.message!.contact.user_id != user_id) {
        await ctx.reply(`Iltimos, o'zingizni telefon raqamingizni yuboring`, {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.contactRequest("Telefon raqamni yuborish")],
          ])
            .resize()
            .oneTime(),
        });
      } else if (user) {
        user.phone_number = ctx.message.contact.phone_number;
        user.is_active = true;
        await user.save();
        await ctx.reply(`Tabriklayman, sizning akkauntingiz faollashtirildi.`, {
          parse_mode: "HTML",
          ...Markup.keyboard([
            ["Xizmatlar"],
            ["Tanlangan xizmatlar"],
            ["Ma'lumotlarni o'zgartirish"],
          ])
            .resize()
            .oneTime(),
        });
      } else if (master) {
        master.phone_number = ctx.message.contact.phone_number;
        master.is_active = true;
        await master.save();
        await ctx.reply(`Tabriklayman, sizning akkauntingiz faollashtirildi.`, {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
        });
        // const messageId = ctx.message.message_id - 1;
        // await ctx.telegram.deleteMessage(ctx.chat!.id, messageId);

        master.last_state = "workshop_name";
        await master.save();
        await ctx.reply(`Ustaxona nomini kiriting`, {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
        });
      }
    }
  }

  async onText(ctx: Context) {
    try {
      if ("text" in ctx.message!) {
        const user_id = ctx.from?.id;
        const user = await this.userModel.findByPk(user_id);
        const master = await this.masterModel.findByPk(user_id);
        if (master && master!.is_active) {
          if (master.last_state !== "finish") {
            if (master.last_state == "workshop_name") {
              master.workshop_name = ctx.message.text;
              master.last_state = "address";
              await master.save();
              await ctx.reply("Ustaxona manzilini kiriting", {
                parse_mode: "HTML",
                ...Markup.removeKeyboard(),
              });
            } else if (master.last_state == "address") {
              master.address = ctx.message.text;
              master.last_state = "address_target";
              await master.save();
              await ctx.reply("Manzilingiz mo'ljalini kiriting", {
                parse_mode: "HTML",
                ...Markup.removeKeyboard(),
              });
            } else if (master.last_state == "address_target") {
              master.address_target = ctx.message.text;
              master.last_state = "location";
              await master.save();
              await ctx.reply("Ustaxona joylashuvini yuboring", {
                parse_mode: "HTML",
                ...Markup.keyboard([
                  [Markup.button.locationRequest("Joylashuvni yuborish")],
                ])
                  .resize()
                  .oneTime(),
              });
            } else if (master.last_state == "average_service_time") {
              master.average_service_time = Number(ctx.message.text);
              master.last_state = "finish";
              await master.save();
              await ctx.reply(
                "Malumotlaringiz tasdiqlanishi uchun adminga yuboriladi. Tasdiqlaysizmi?",
                {
                  parse_mode: "HTML",
                  ...Markup.keyboard([
                    ["✅ Tasdiqlash", "❌ Bekor qilish"],
                  ]).resize(),
                }
              );
            }
          } else if (master.edit_last_state !== null) {
            if (master.edit_last_state === "edit_master_name") {
              master.first_name = ctx.message.text;
              master.edit_last_state = null;
              await master.save();
              await ctx.reply("Ismingiz o'zgartirildi.");
            } else if (master.edit_last_state === "edit_workshop_name") {
              master.workshop_name = ctx.message.text;
              master.edit_last_state = null;
              await master.save();
              await ctx.reply("Ustaxona nomi o'zgartirildi.");
            } else if (master.edit_last_state === "edit_address") {
              master.address = ctx.message.text;
              master.edit_last_state = null;
              await master.save();
              await ctx.reply("Manzil o'zgartirildi.");
            } else if (master.edit_last_state === "edit_address_target") {
              master.address_target = ctx.message.text;
              master.edit_last_state = null;
              await master.save();
              await ctx.reply("Manzil mo'ljali o'zgartirildi.");
            } else if (master.edit_last_state === "edit_average_service_time") {
              master.average_service_time = Number(ctx.message.text);
              master.edit_last_state = null;
              await master.save();
              await ctx.reply(
                "Har bir mijoz uchun sarflanadigan vaqt o'zgartirildi."
              );
            }
          }
        } else if (user && user.is_active) {
          const service_id = ctx.callbackQuery!["data"].split("_")[1];

          const masters = await this.masterModel.findAll({
            where: {
              first_name: {
                [Op.iLike]: `%${ctx.message.text.trim()}%`,
              },
              is_verified: true,
              service_id,
            },
          });

          if (masters.length > 0) {
            for (const master of masters) {
              const message = `👤 Ism: ${master.first_name}\n🏢 Ustaxona nomi: ${master.workshop_name}\n📍 Manzil: ${master.address}\n📌 Mo'ljal: ${master.address_target}\n📞 Telefon raqam: ${master.phone_number}\n📊 Reyting: ${master.reyting}`;
              await ctx.replyWithHTML(message);
            }
          }
        } else if (user_id == process.env.ADMIN) {
          const newService = await this.serviceModel.create({
            name: ctx.message.text,
          });
          if (newService) {
            await ctx.reply("Xizmat nomi muvaffaqiyatli qo'shildi", {
              parse_mode: "HTML",
              ...Markup.keyboard([
                ["🛠 Xizmatlar", "👥 Mijozlar", "🧑‍🔧 Ustalar"],
              ])
                .oneTime()
                .resize(),
            });
          }
        } else {
          await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["Ro'yxatdan o'tish"]]).resize(),
          });
        }
      }
    } catch (error) {
      console.log("Ontextda error", error);
    }
  }
}
