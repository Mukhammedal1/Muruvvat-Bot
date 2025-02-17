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
import { MasterService } from "./master.service";
import { UseFilters, UseGuards } from "@nestjs/common";
import { TelegrafExceptionFilter } from "../filters/telegraf-exception.filter";
import { AdminGuard } from "../guard/admin_bot.guard";
import { UsersService } from "./users.service";

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly masterService: MasterService,
    private readonly userService: UsersService
  ) {}

  @UseFilters(TelegrafExceptionFilter)
  @UseGuards(AdminGuard)
  @Command("admin")
  async onAdminCommand(@Ctx() ctx: Context) {
    await this.botService.admin_menu(ctx, "Xush kelibsiz Admin");
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Hears("Ro'yxatdan o'tish")
  async register(@Ctx() ctx: Context) {
    await this.botService.register(ctx);
  }

  @Hears("👨‍🔧 Usta")
  async jobSession(@Ctx() ctx: Context) {
    await this.masterService.jobSession(ctx);
  }
  @Hears("👤 Mijoz")
  async registrUser(@Ctx() ctx: Context) {
    await this.userService.registrUser(ctx);
  }

  @Hears("👤 Mijozlar")
  async showMijoz(@Ctx() ctx: Context) {
    await this.masterService.showMijoz(ctx);
  }

  @Action(/^jobsessionMaster_\d+$/)
  async onServices(@Ctx() ctx: Context) {
    await this.masterService.masterRegister(ctx);
  }
  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    await this.masterService.onLocation(ctx);
  }

  @Action(/^start_+\d+/)
  async onStartTime(@Ctx() ctx: Context) {
    await this.masterService.onStartTime(ctx);
  }
  @Action(/^end_+\d+/)
  async onEndTime(@Ctx() ctx: Context) {
    await this.masterService.onEndTime(ctx);
  }

  @Hears("✅ Tasdiqlash")
  async onVerifyMaster(@Ctx() ctx: Context) {
    await this.botService.onVerifyMaster(ctx);
  }

  @Hears("❌ Bekor qilish")
  async onVerifyCancel(@Ctx() ctx: Context) {
    await this.botService.onVerifyCancel(ctx);
  }

  @Action(/^yes_+\d+/)
  async verifyMasterYes(@Ctx() ctx: Context) {
    await this.botService.verifyResultYes(ctx);
  }
  @Action(/^no_+\d+/)
  async verifyMasterNo(@Ctx() ctx: Context) {
    await this.botService.verifyResultNo(ctx);
  }

  @Hears("✅ Tekshirish")
  async onCheck(@Ctx() ctx: Context) {
    await this.masterService.onCheck(ctx);
  }

  @Hears("Xizmatlar")
  async onServices2(@Ctx() ctx: Context) {
    await this.userService.jobSession(ctx);
  }

  @Hears("🛠 Xizmatlar")
  async adminServices(@Ctx() ctx: Context) {
    await this.botService.adminServices(ctx);
  }

  @Hears("➕ Xizmat qo'shish")
  async addService(@Ctx() ctx: Context) {
    await this.botService.adminServices(ctx);
  }

  @Hears("Tanlangan xizmatlar")
  async selectedService(@Ctx() ctx: Context) {
    await this.userService.selectedService(ctx);
  }

  @Action(/^jobsession_\d+$/)
  async onClickJobSession(@Ctx() ctx: Context) {
    await this.userService.onClickJobSession(ctx);
  }

  @Action(/^ism_\d+$/)
  async onClickMasterName(@Ctx() ctx: Context) {
    await this.userService.onClickMasterName(ctx);
  }

  @Action(/^reyting_\d+$/)
  async onClickMasterReyting(@Ctx() ctx: Context) {
    await this.userService.onClickMasterReyting(ctx);
  }

  @Action(/^locat_\d+$/)
  async onClickMasterLocation(@Ctx() ctx: Context) {
    await this.userService.onClickMasterLocation(ctx);
  }

  @Action(/^master_\d+$/)
  async onClickMasterList(@Ctx() ctx: Context) {
    await this.masterService.onClickMasterList(ctx);
  }

  @Action(/^locat_\d+$/)
  async onClickWorshopLocation(@Ctx() ctx: Context) {
    await this.masterService.onClickWorshopLocation(ctx);
  }

  @Action(/^baho_\d+$/)
  async onClickMark(@Ctx() ctx: Context) {
    await this.masterService.onClickMark(ctx);
  }
  @Action(/^time_\d+$/)
  async onClickTime(@Ctx() ctx: Context) {
    await this.masterService.onClickTime(ctx);
  }

  @Action(/^mark_\d+_\d+$/)
  async onClickMarked(@Ctx() ctx: Context) {
    await this.masterService.onClickMarked(ctx);
  }

  @Action(/^date_\d+_\d+\.\d+$/)
  async onClickDay(@Ctx() ctx: Context) {
    await this.masterService.onClickDay(ctx);
  }
  @Action(/^brontime_\d+_\d+_(\d{2}:\d{2})_\d{1,2}\.\d{1,2}$/)
  async onClick(@Ctx() ctx: Context) {
    await this.masterService.onClickVaqt(ctx);
  }

  @Action(/^qabul_\d+_\d+_(\d{2}:\d{2})_\d{1,2}\.\d{1,2}$/)
  async onClickAccept(@Ctx() ctx: Context) {
    await this.masterService.onClickAccept(ctx);
  }
  @Action(/^bekor_\d+_\d+_(\d{2}:\d{2})_\d{1,2}\.\d{1,2}$/)
  async onClickNotAccept(@Ctx() ctx: Context) {
    await this.masterService.onClickNotAccept(ctx);
  }
  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}
