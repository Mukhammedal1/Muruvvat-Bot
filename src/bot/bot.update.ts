import { BotService } from "./bot.service";
import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { Context } from "telegraf";
import { SabrliService } from "./sabrli.service";
import { UseFilters, UseGuards } from "@nestjs/common";
import { TelegrafExceptionFilter } from "../filters/telegraf-exception.filter";
import { AdminGuard } from "../guard/admin_bot.guard";
import { SahiyService } from "./sahiy.service";

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly sahiyService: SahiyService,
    private readonly sabrliService: SabrliService
  ) {}

  @UseFilters(TelegrafExceptionFilter)
  @UseGuards(AdminGuard)
  @Command("admin")
  async onAdminCommand(@Ctx() ctx: Context) {
    await this.botService.admin_menu(ctx);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.onstart(ctx);
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    await this.sahiyService.onLocation(ctx);
  }

  @Hears("Sahiy")
  async registerSahiy(@Ctx() ctx: Context) {
    await this.sahiyService.registerSahiy(ctx);
  }

  @Hears("Sabrli")
  async registerSabrli(@Ctx() ctx: Context) {
    await this.sabrliService.registerSabrli(ctx);
  }

  @Hears("Muruvvat qilish")
  async onclickMuruvvatQilish(@Ctx() ctx: Context) {
    await this.sahiyService.onclickMuruvvatQilish(ctx);
  }

  @Hears("Sabrlilarni ko'rish")
  async onclickShowSabrli(@Ctx() ctx: Context) {
    await this.sahiyService.onclickShowSabrli(ctx);
  }

  @Hears("Barcha sabrlilar")
  async onclickSeeSabrli(@Ctx() ctx: Context) {
    await this.sahiyService.onclickSeeSabrli(ctx);
  }

  @Hears("Barcha sabrlilar")
  async onclickAllSabrli(@Ctx() ctx: Context) {
    await this.sahiyService.onclickAllSabrli(ctx);
  }

  @Hears("Murojat yo'llash")
  async onclickMurojat(@Ctx() ctx: Context) {
    await this.sabrliService.onclickMurojat(ctx);
  }

  @Action("check_sub")
  async checkSubscribeChanel(@Ctx() ctx: Context) {
    await this.botService.checkSubscribeChanel(ctx);
  }

  @Action(/^(male|female)_\d+$/)
  async onActionGender(@Ctx() ctx: Context) {
    await this.sabrliService.onActionGender(ctx);
  }

  @On("photo")
  async onPhoto(@Ctx() ctx: Context) {
    await this.sabrliService.onPhoto(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}
