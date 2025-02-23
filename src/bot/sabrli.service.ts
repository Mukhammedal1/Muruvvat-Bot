import { Injectable } from "@nestjs/common";
import { CreateMasterDto } from "./dto/create-master.dto";
import { UpdateMasterDto } from "./dto/update-master.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Sabrli } from "./models/sabrli.model";
import { Context, Markup } from "telegraf";
import { Sahiy } from "./models/sahiy.model";
import { callback } from "telegraf/typings/button";
import { Murojat } from "./models/murojat.model";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { error } from "console";

@Injectable()
export class SabrliService {
  constructor(
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectModel(Murojat) private readonly murojatModel: typeof Murojat
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

  async onclickMurojat(ctx: Context) {
    const sabrli_id = ctx.from?.id;
    const murojat = await this.murojatModel.create({
      sabrli_id,
      last_state: "image",
    });
    await ctx.reply("Iltimos, rasmingizni yuboring", {
      ...Markup.removeKeyboard(),
    });
  }

  async onPhoto(ctx: Context) {
    const sabrli_id = ctx.from?.id;
    const message: any = ctx.message;
    try {
      if (!message.photo || message.photo.length === 0) {
        return ctx.reply("❌ Hech qanday rasm topilmadi.");
      }
      const fileId = message.photo.pop().file_id;
      const botToken = process.env.BOT_TOKEN;
      const { data } = await axios.get(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
      );
      if (!data.result || !data.result.file_path) {
        return ctx.reply("❌ Telegram API dan faylni olishda xatolik.");
      }
      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
      const fileName = `photo_${Date.now()}.jpg`;
      const uploadsDir = path.join(__dirname, "..", "..", "uploads");
      const savePath = path.join(uploadsDir, fileName);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const response = await axios({ url: fileUrl, responseType: "stream" });
      const murojat = await this.murojatModel.findOne({
        where: { sabrli_id, last_state: "image" },
      });
      murojat!.image = fileId;
      murojat!.last_state = "item";
      await murojat!.save();
      response.data.pipe(fs.createWriteStream(savePath));
      await ctx.reply("Nima kerak", {
        ...Markup.removeKeyboard(),
      });
    } catch (error) {
      console.error("fayl saqlashda Xatolik", error);
    }
  }

  async onActionGender(ctx: Context) {
    try {
      const sabrli_id = ctx.callbackQuery!["data"].split("_")[1];
      const gender = ctx.callbackQuery!["data"].split("_")[0];
      const murojat = await this.murojatModel.findOne({
        where: { sabrli_id, last_state: "gender" },
      });

      if (murojat) {
        murojat.gender = gender;
        murojat.last_state = "height";
        await murojat.save();

        await ctx.reply(`Bo'yingizni kiriting (sm)da, masalan(150)`, {
          ...Markup.removeKeyboard(),
        });
      }
    } catch (error) {
      console.log("onActionGender error: ", error);
    }
  }
}
