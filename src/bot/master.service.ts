import { Injectable } from "@nestjs/common";
import { CreateMasterDto } from "./dto/create-master.dto";
import { UpdateMasterDto } from "./dto/update-master.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Master } from "./models/master.model";
import { Context, Markup } from "telegraf";
import { User } from "./models/user.model";
import { callback } from "telegraf/typings/button";
import { BronTime } from "./models/bron_time.model";
import { Service } from "./models/services.model";

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Service) private readonly serviceModel: typeof Service,
    @InjectModel(BronTime) private readonly bronTimeModel: typeof BronTime
  ) {}

  async jobSession(ctx: Context) {
    const services = await this.serviceModel.findAll();

    const buttons: any[] = services.map((service) => [
      {
        text: service.name,
        callback_data: `jobsessionMaster_${service.id}`,
      },
    ]);

    await ctx.replyWithHTML(`Quyidagi bo'limlardan birini tanlang`, {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  async masterRegister(ctx: Context) {
    try {
      const service_id = ctx.callbackQuery!["data"].split("_")[1];
      const master_id = ctx.from?.id;
      const master = await this.masterModel.findByPk(master_id);
      if (!master) {
        await this.masterModel.create({
          id: master_id,
          username: ctx.from?.username,
          first_name: ctx.from?.first_name,
          lang: ctx.from?.language_code,
          service_id,
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

  async onLocation(ctx: Context) {
    try {
      if ("location" in ctx.message!) {
        const master_id = ctx.from?.id;
        const master = await this.masterModel.findByPk(master_id);
        const user = await this.userModel.findByPk(master_id);
        if ((!master || !master.is_active) && (!user || !user.is_active)) {
          await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["Ro'yxatdan o'tish"]]).resize().oneTime()
          });
        }
        if (master && master!.last_state == "location") {
          master!.location = `${ctx.message.location.latitude}, ${ctx.message.location.longitude}`;
          master!.last_state = "start_time";
          await master!.save();

          let i: number = 9;
          const buttons: any[] = [];

          while (i <= 18) {
            buttons.push([
              {
                text: `⏰ ${i}:00`,
                callback_data: `start_${i}`,
              },
            ]);
            i += 1;
          }
          await ctx.reply("Ish boshlanish vaqtini tanlang:", {
            reply_markup: {
              inline_keyboard: buttons,
            },
          });
          await ctx.reply("", {
            ...Markup.removeKeyboard()
          });
        } else if (master && master!.edit_last_state == "edit_location") {
          master!.location = `${ctx.message.location.latitude}, ${ctx.message.location.longitude}`;
          master!.edit_last_state = null;
          await master!.save();
          await ctx.reply("Yangi joylashuv saqlandi");
        }
        if (user && user.is_active) {
          user!.location = `${ctx.message.location.latitude}, ${ctx.message.location.longitude}`;
          await user.save();
          const masters = await this.masterModel.findAll({
            where: { is_verified: true },
          });
          const buttons: any[] = [];
          for (const master of masters) {
            buttons.push([
              {
                text: `👷 ${master.first_name}:  📍 ${master.address}`,
                callback_data: `master_${master.id}`,
              },
            ]);
          }
          await ctx.reply("Manzil bo'yicha eng yaqin ustalar ro'yxati", {
            reply_markup: {
              remove_keyboard: true,
              inline_keyboard: buttons,
            },
          });
        }
      }
    } catch (error) {
      console.log("OnLocation error", error);
    }
  }

  async onStartTime(ctx: Context) {
    const master_id = ctx.from?.id;
    const master = await this.masterModel.findByPk(master_id);
    const time = ctx.callbackQuery!["data"].split("_")[1];

    if (master!.last_state == "start_time") {
      if (time >= 1 && time <= 9) {
        master!.start_time = `0${time}`;
      } else {
        master!.start_time = time;
      }
      master!.last_state = "end_time";
      await master!.save();

      let i: number = 9;
      const buttons: any[] = [];

      while (i <= 18) {
        buttons.push([
          {
            text: `⏰ ${i}:00`,
            callback_data: `end_${i}`,
          },
        ]);
        i += 1;
      }
      await ctx.reply("Ish tugash vaqtini tanlang:", {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    } else if (master!.edit_last_state == "edit_start_time") {
      if (time >= 1 && time <= 9) {
        master!.start_time = `0${time}`;
      } else {
        master!.start_time = time;
      }
      master!.edit_last_state = null;
      await master!.save();
      await ctx.reply("Ish boshlanish vaqti o'zgartirildi");
    }
  }

  async onEndTime(ctx: Context) {
    const master_id = ctx.from?.id;
    const master = await this.masterModel.findByPk(master_id);
    const time = ctx.callbackQuery!["data"].split("_")[1];
    if (master!.last_state == "end_time") {
      if (time >= 1 && time <= 9) {
        master!.end_time = `0${time}`;
      } else {
        master!.end_time = time;
      }

      master!.last_state = "average_service_time";
      await master!.save();

      await ctx.reply(
        "Har bir buyurtma uchun qancha vaqt sarflanishini kiriting (daqiqada)",
        {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
        }
      );
    } else if (master!.edit_last_state == "edit_end_time") {
      if (time >= 1 && time <= 9) {
        master!.end_time = `0${time}`;
      } else {
        master!.end_time = time;
      }
      master!.edit_last_state = null;
      await master!.save();
      await ctx.reply("Ish tugash vaqti o'zgartirildi");
    }
  }

  async onCheck(ctx: Context) {
    const master_id = ctx.from?.id;
    const master = await this.masterModel.findByPk(master_id);
    if (!master) {
      await ctx.reply(`Afsuski malumotlaringiz bekor qilindi`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["Ro'yxatdan o'tish"]])
          .resize()
          .oneTime(),
      });
    } else if (master?.is_verified) {
      await ctx.reply(`Malumotlaringiz tasdiqlandi`, {
        parse_mode: "HTML",
        ...Markup.keyboard([
          ["👤 Mijozlar", "🕜 Vaqt", "⭐️ Reyting"],
          ["✏️ Malumotlarni o'zgartirish"],
        ])
          .resize()
      });
    } else {
      await ctx.reply(
        `Iltimos ma'lumotlaringiz tasdiqlanishini kuting. Tasdiqlanmoqda...`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            ["✅ Tekshirish", "❌ Bekor qilish"],
            ["Admin bilan bog'lanish"],
          ]).resize(),
        }
      );
    }
  }

  async onClickMasterList(ctx: Context) {
    const master_id = ctx.callbackQuery!["data"].split("_")[1];

    const master = await this.masterModel.findByPk(master_id);
    const service = await this.serviceModel.findOne({
      where: { id: master!.service_id },
    });
    if (master) {
      await ctx.reply(
        `Usta ma'lumotlari\n👤 Ismi: ${master.first_name}\n💼 Kasbi: ${service?.name}\n📞 Telefon raqami: ${master.phone_number}\n🏢 Ustaxona nomi: ${master.workshop_name}\n📍 Manzil: ${master.address}\n📌 Mo'ljal: ${master.address_target}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `📍 Lokatsiyasi`,
                  callback_data: `locat_${master_id}`,
                },
                {
                  text: `🕜 Vaqt olish`,
                  callback_data: `time_${master_id}`,
                },
              ],
              [
                {
                  text: `⭐️ Baholash`,
                  callback_data: `baho_${master_id}`,
                },
                {
                  text: `⬅️ Ortga`,
                  callback_data: `back_${master_id}`,
                },
              ],
            ],
          },
        }
      );
    }
  }

  async onClickWorshopLocation(ctx: Context) {
    const master_id = ctx.callbackQuery!["data"].split("_")[1];
    const master = await this.masterModel.findByPk(master_id);
    if (master) {
      const lat = Number(master.location?.split(",")[0]);
      const long = Number(master.location?.split(",")[1]);
      await ctx.replyWithLocation(lat, long);
    }
  }

  async onClickMark(ctx: Context) {
    const master_id = ctx.callbackQuery!["data"].split("_")[1];
    const service_id = ctx.callbackQuery!["data"].split("_")[2];
    const master = await this.masterModel.findByPk(master_id);
    if (master) {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [
            {
              text: "⭐️",
              callback_data: `mark_1_${master_id}`,
            },
          ],
          [
            {
              text: "⭐️⭐️",
              callback_data: `mark_2_${master_id}`,
            },
          ],
          [
            {
              text: "⭐️⭐️⭐️",
              callback_data: `mark_3_${master_id}`,
            },
          ],
          [
            {
              text: "⭐️⭐️⭐️⭐️",
              callback_data: `mark_4_${master_id}`,
            },
          ],
          [
            {
              text: "⭐️⭐️⭐️⭐️⭐️",
              callback_data: `mark_5_${master_id}`,
            },
          ],
        ],
      });
    }
  }

  async onClickMarked(ctx: Context) {
    const user_id = ctx.from?.id;
    const user = await this.userModel.findByPk(user_id);
    const mark = Number(ctx.callbackQuery!["data"].split("_")[1]);
    const master_id = ctx.callbackQuery!["data"].split("_")[2];
    const service_id = ctx.callbackQuery!["data"].split("_")[3];
    console.log(service_id);
    const master = await this.masterModel.findByPk(master_id);

    if (user && master) {
      if (user.marked == 0) {
        user.marked = mark;
        const result =
          (Number(master.reyting) + mark) / (Number(master.reyting_count) + 1);
        master.reyting = result;
        master.reyting_count += 1;
        await user.save();
        await master.save();
      } else {
        // if(master.marked_userId==user_id){

        // }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        master.reyting =
          (master.reyting - user.marked + mark) / master.reyting_count;
        user.marked = mark;
        await user.save();
        await master.save();
      }

      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [
            {
              text: `📍 Lokatsiyasi`,
              callback_data: `locat_${master_id}_${service_id}`,
            },
            {
              text: `🕜 Vaqt olish`,
              callback_data: `time_${master_id}_${service_id}`,
            },
          ],
          [
            {
              text: `⭐️ Baholash`,
              callback_data: `baho_${master_id}_${service_id}`,
            },
            {
              text: `⬅️ Ortga`,
              callback_data: `back_${master_id}_${service_id}`,
            },
          ],
        ],
      });
    }
  }

  async onClickTime(ctx: Context) {
    const master_id = ctx.callbackQuery!["data"].split("_")[1];
    const service_id = ctx.callbackQuery!["data"].split("_")[2];
    const master = await this.masterModel.findByPk(master_id);
    if (master) {
      const getNext7DaysButtons = () => {
        const buttons: any[] = [];
        const today = new Date();
        const day = today.getDate();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        for (let i = 0; i < 7; i++) {
          buttons.push([
            {
              text: `📅  ${day + i}.${month}`,
              callback_data: `date_${master_id}_${day + i}.${month}`,
            },
          ]);
        }

        buttons.push([{ text: "⬅️ ortga", callback_data: "back" }]);
        return buttons;
      };

      await ctx.reply("Iltimos, qulay sanani tanlang:", {
        reply_markup: {
          inline_keyboard: getNext7DaysButtons(),
        },
      });
    }
  }

  async masterTime(ctx: Context) {
    const master_id = ctx.from?.id;
    const master = await this.masterModel.findByPk(master_id);
    if (master) {
      const getNext7DaysButtons = () => {
        const buttons: any[] = [];
        const today = new Date();
        const day = today.getDate();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        for (let i = 0; i < 7; i++) {
          buttons.push([
            {
              text: `📅  ${day + i}.${month}`,
              callback_data: `date_${master_id}_${day + i}.${month}`,
            },
          ]);
        }

        // buttons.push([{ text: "⬅️ ortga", callback_data: `back_${master_id}` }]);
        return buttons;
      };

      await ctx.reply("Ish kunlaringiz", {
        reply_markup: {
          inline_keyboard: getNext7DaysButtons(),
        },
      });
    }
  }

  async onClickDay(ctx: Context) {
    const user_id = ctx.from?.id;
    const master_id = ctx.callbackQuery!["data"].split("_")[1];
    const day = ctx.callbackQuery!["data"].split("_")[2];
    const master = await this.masterModel.findByPk(master_id);
    const getAvailableTimesInline = async (
      startTime: string,
      endTime: string,
      interval: number
    ) => {
      const times: any[] = [];
      let currentTime = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      let row: any[] = [];

      while (currentTime < end) {
        const nextTime = new Date(currentTime.getTime() + interval * 60000);
        const timeStr = currentTime.toTimeString().slice(0, 5);

        const bronTime = await this.bronTimeModel.findOne({
          where: { master_id, bron_time: timeStr, day },
        });

        if (bronTime) {
          row.push({
            text: `❌ ${timeStr}`,
            callback_data: `brontime_${master_id}_${user_id}_${timeStr}_${day}`,
          });
        } else {
          row.push({
            text: `${timeStr}`,
            callback_data: `brontime_${master_id}_${user_id}_${timeStr}_${day}`,
          });
        }

        if (row.length === 2) {
          times.push(row);
          row = [];
        }

        currentTime = nextTime;
      }

      if (row.length > 0) times.push(row);
      times.push([{ text: "⬅️ ortga", callback_data: `back_${master_id}` }]);

      return times;
    };

    const workStart = `${master?.start_time}:00`;
    const workEnd = `${master?.end_time}:00`;
    const clientInterval = master?.average_service_time;

    const availableTimes = await getAvailableTimesInline(
      workStart,
      workEnd,
      clientInterval!
    );
    await ctx.reply("Iltimos, qulay vaqtni tanlang:", {
      reply_markup: {
        inline_keyboard: availableTimes,
      },
    });
  }

  async onClickVaqt(ctx: Context) {
    const master_id = ctx.callbackQuery!["data"].split("_")[1];
    const user_id = ctx.callbackQuery!["data"].split("_")[2];
    const user = await this.userModel.findByPk(user_id);
    const time = ctx.callbackQuery!["data"].split("_")[3];
    const day = ctx.callbackQuery!["data"].split("_")[4];
    console.log(time);
    const bron_time = await this.bronTimeModel.findOne({
      where: { master_id, bron_time: time, day },
    });
    if (bron_time) {
      await ctx.reply("Iltimos boshqa vaqtni tanlang, bu vaqt band qilingan");
    } else {
      await ctx.reply(
        "Tanlangan vaqt ustaga yuborildi. Iltimos kuting, qabul qilinmoqda..."
      );
      await ctx.telegram.sendMessage(
        master_id,
        `📢 Sizga buyurtma keldi\n 👤 Ism: ${user!.first_name}\n 📅 Sana: ${day}\n🕜 Vaqti: ${time}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `✅ Qabul qilish`,
                  callback_data: `qabul_${master_id}_${user_id}_${time}_${day}`,
                },
                {
                  text: `❌ Bekor qilish`,
                  callback_data: `bekor_${master_id}_${user_id}_${time}_${day}`,
                },
              ],
            ],
          },
        }
      );
    }
  }

  async onClickAccept(ctx: Context) {
    const master_id = ctx.callbackQuery!["data"].split("_")[1];
    const user_id = ctx.callbackQuery!["data"].split("_")[2];
    const user = await this.userModel.findByPk(user_id);
    const time = ctx.callbackQuery!["data"].split("_")[3];
    const day = ctx.callbackQuery!["data"].split("_")[4];

    await this.bronTimeModel.create({
      master_id,
      user_id,
      bron_time: time,
      day,
    });
    await ctx.telegram.sendMessage(
      user_id,
      `✅ Tanlangan vaqt band qilindi\n👤 Ism: ${user?.first_name}\n 📅 Sana: ${day}\n🕜 Vaqti: ${time}`
    );
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [{ text: "✅ Buyurtma olindi", callback_data: "accepted" }],
      ],
    });
  }

  async onClickNotAccept(ctx: Context) {
    const user_id = ctx.callbackQuery!["data"].split("_")[2];
    await ctx.telegram.sendMessage(
      user_id,
      "❌ Tanlangan vaqt band qilinmadi. Iltimos qaytadan urinib ko'ring!"
    );
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [{ text: "❌ Buyurtma bekor qilindi", callback_data: "notaccepted" }],
      ],
    });
  }

  async showMijoz(ctx: Context) {
    const master_id = ctx.from?.id;
    const bronTimes = await this.bronTimeModel.findAll({
      where: { master_id },
    });
    if (bronTimes.length > 0) {
      for (const brontime of bronTimes) {
        const user = await this.userModel.findOne({
          where: { id: brontime?.user_id },
        });

        await ctx.reply(
          `👤 Ism: ${user?.first_name}\n📞Telefon raqami: ${user?.phone_number}\n🕜 Vaqti: ${brontime.bron_time}\n📅 Sana: ${brontime.day}\n`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📩 Xabar yuborish",
                    callback_data: `send_${user?.id}`,
                  },
                ],
                [
                  {
                    text: "❌ Bekor qilish",
                    callback_data: `delbron_${user?.id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else {
      await ctx.reply("Mijozlar mavjud emas");
    }
  }

  async masterInfoEdit(ctx: Context) {
    const master_id = ctx.from?.id;
    const master = await this.masterModel.findOne({ where: { id: master_id } });
    if (master) {
      await ctx.reply("Qaysi ma'lumotingizni o'zgartirmoqchisiz", {
        ...Markup.inlineKeyboard([
          [{ text: "Ism", callback_data: "edit_master_name" }],
          [{ text: "Ustaxona nomi", callback_data: "edit_workshop_name" }],
          [{ text: "Manzil", callback_data: "edit_address" }],
          [
            {
              text: "Manzil mo'ljali",
              callback_data: "edit_address_target",
            },
          ],
          [
            {
              text: "Ishni boshlash vaqti",
              callback_data: "edit_start_time",
            },
          ],
          [
            {
              text: "Ishni tugatish vaqti",
              callback_data: "edit_end_time",
            },
          ],
          [
            {
              text: "Ustaxona lokatsiyasi",
              callback_data: "edit_location",
            },
          ],
          [
            {
              text: "Mijoz uchun sarflanadigan vaqt",
              callback_data: "edit_average_service_time",
            },
          ],
          [{ text: "⬅️ Ortga", callback_data: "back_to_menu" }],
        ]),
      });
    }
  }

  async onEditMaster(ctx: Context) {
    const master_id = ctx.from?.id;
    const master = await this.masterModel.findOne({ where: { id: master_id } });
    const data = ctx.callbackQuery!["data"];
    if (master) {
      if (data === "edit_master_name") {
        master.edit_last_state = "edit_master_name";
        await master.save();
        await ctx.reply("Ismingizni kiriting:");
      } else if (data === "edit_workshop_name") {
        master.edit_last_state = "edit_workshop_name";
        await master.save();
        await ctx.reply("Ustaxona yangi nomini kiriting:");
      } else if (data === "edit_average_service_time") {
        master.edit_last_state = "edit_average_service_time";
        await master.save();
        await ctx.reply(
          "Har bir mijoz uchun sarflanadigan vaqtni kiriting (daqiqada)"
        );
      } else if (data === "edit_address") {
        master.edit_last_state = "edit_address";
        await master.save();
        await ctx.reply("Yangi manzilni kiriting:");
      } else if (data === "edit_address_target") {
        master.edit_last_state = "edit_address_target";
        await master.save();
        await ctx.reply("Yangi mo'ljalni kiriting:");
      } else if (data === "edit_start_time") {
        master.edit_last_state = "edit_start_time";
        await master.save();
        let i: number = 9;
        const buttons: any[] = [];

        while (i <= 18) {
          buttons.push([
            {
              text: `⏰ ${i}:00`,
              callback_data: `start_${i}`,
            },
          ]);
          i += 1;
        }
        await ctx.reply("Ish boshlanish vaqtini tanlang:", {
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
      } else if (data === "edit_end_time") {
        master.edit_last_state = "edit_end_time";
        await master.save();
        let i: number = 9;
        const buttons: any[] = [];

        while (i <= 18) {
          buttons.push([
            {
              text: `⏰ ${i}:00`,
              callback_data: `end_${i}`,
            },
          ]);
          i += 1;
        }
        await ctx.reply("Ish tugash vaqtini tanlang:", {
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
      } else if (data === "edit_location") {
        master.edit_last_state = "edit_location";
        await master.save();
        await ctx.reply("Ustaxonani yangi joylashuvini yuboring", {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.locationRequest("Joylashuvni yuborish")],
          ])
            .resize()
            .oneTime(),
        });
      }
    }
  }
}
