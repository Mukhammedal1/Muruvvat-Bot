import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TelegrafException, TelegrafExecutionContext } from "nestjs-telegraf";
import { Observable } from "rxjs";
import { Context } from "telegraf";

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly ADMIN = process.env.ADMIN;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<Context>();

    if (Number(this.ADMIN) != from!.id) {
      throw new TelegrafException("Siz admin emassiz");
    }
    return true;
  }
}
