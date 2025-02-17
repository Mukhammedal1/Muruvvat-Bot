import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./models/user.model";
import { Context, Markup } from "telegraf";
import { Master } from "./models/master.model";
import { text } from "stream/consumers";
import { Service } from "./models/services.model";
import { BronTime } from "./models/bron_time.model";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(Service) private readonly serviceModel: typeof Service,
    @InjectModel(BronTime) private readonly bronTimeModel: typeof BronTime
  ) {}
  async registrUser(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        await this.userModel.create({
          id: user_id,
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
      } else if (!user.is_active) {
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
      } else {
        await ctx.reply(`Botga xush kelibsiz`, {
          parse_mode: "HTML",
          ...Markup.keyboard([
            ["Xizmatlar"],
            ["Tanlangan xizmatlar"],
            ["Ma'lumotlarni o'zgartirish"],
          ])
            .resize()
            .oneTime(),
        });
      }
    } catch (error) {
      console.log("registrUser error", error);
    }
  }

  async jobSession(ctx: Context) {
    const services = await this.serviceModel.findAll();

    const buttons: any[] = services.map((service) => [
      {
        text: service.name,
        callback_data: `jobsession_${service.id}`,
      },
    ]);

    await ctx.replyWithHTML(`Quyidagi bo'limlardan birini tanlang`, {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  async onClickJobSession(ctx: Context) {
    const service_id = ctx.callbackQuery!["data"].split("_")[1];
    const masters = await this.masterModel.findAll({ where: { service_id } });
    if (masters.length > 0) {
      await ctx.replyWithHTML(`Ustani qaysi xususiyati bo'yicha tanlaysiz`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "👤 Ism", callback_data: `ism_${service_id}` },
              { text: "⭐️ Reyting", callback_data: `reyting_${service_id}` },
            ],
            [{ text: "📍 Lokatsiya", callback_data: `locat_${service_id}` }],
          ],
        },
      });
    } else {
      await ctx.reply("Bu sohada ustalar mavjud emas");
    }
  }

  async onClickMasterName(ctx: Context) {
    await ctx.reply(`Usta ismini kiriting`, {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
    });
  }

  async onClickMasterReyting(ctx: Context) {
    const service_id = ctx.callbackQuery!["data"].split("_")[1];

    const masters = await this.masterModel.findAll({
      where: { is_verified: true, service_id },
    });
    if (masters.length > 0) {
      const buttons: any[] = [];
      let newReyting: string = "";

      for (const master of masters) {
        if (master.reyting == 0) {
          newReyting = "0";
        } else if (master.reyting > 0 && master.reyting <= 1) {
          newReyting = "⭐️";
        } else if (master.reyting > 1 && master.reyting <= 2) {
          newReyting = "⭐️⭐️";
        } else if (master.reyting > 2 && master.reyting <= 3) {
          newReyting = "⭐️⭐️⭐️";
        } else if (master.reyting > 3 && master.reyting <= 4) {
          newReyting = "⭐️⭐️⭐️⭐️";
        } else if (master.reyting > 4 && master.reyting <= 5) {
          console.log(master.reyting);
          newReyting = "⭐️⭐️⭐️⭐️⭐️";
        }

        buttons.push([
          {
            text: `👷 ${master.first_name}:  ${newReyting}`,
            callback_data: `master_${master.id}`,
          },
        ]);
      }

      await ctx.reply("Reyting bo'yicha ustalar ro'yxati", {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }else{
      await ctx.reply("Ustalar mavjud emas")
    }
  }

  async onClickMasterLocation(ctx: Context) {
    const user_id = ctx.from?.id;
    const user = await this.userModel.findByPk(user_id);
    if (user && user.is_active) {
      await ctx.reply("Iltimos joylashuvingizni yuboring", {
        parse_mode: "HTML",
        ...Markup.keyboard([
          [Markup.button.locationRequest("Joylashuvni yuborish")],
        ])
          .resize()
          .oneTime(),
      });
    } else {
      await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["Ro'yxatdan o'tish"]]).resize(),
      });
    }
  }

  async selectedService(ctx: Context) {
    const user_id = ctx.from?.id;
    const user = await this.userModel.findOne({ where: { id: user_id } });
    const bronTimes = await this.bronTimeModel.findAll({ where: { user_id } });

    if (bronTimes.length > 0) {
      for (const brontime of bronTimes) {
        const master = await this.masterModel.findOne({
          where: { id: brontime?.master_id },
        });
        const service = await this.serviceModel.findOne({
          where: { id: master?.service_id },
        });
        await ctx.reply(
          `👤 Ism: ${user?.first_name}\n🕜 Vaqti: ${brontime.bron_time}\n📅 Sana: ${brontime.day}\n💼 Xizmat turi: ${service?.name}\n🏢 Ustaxona nomi: ${master!.workshop_name}\n📍 Manzil: ${master!.address}\n📌 Mo'ljal: ${master!.address_target}`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📩 Xabar yuborish",
                    callback_data: `send_${master?.id}`,
                  },
                ],
                [
                  {
                    text: "❌ Bekor qilish",
                    callback_data: `delbron_${service?.id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else {
      await ctx.reply("Band qilingan xizmatlar mavjud emas");
    }
  }
}
