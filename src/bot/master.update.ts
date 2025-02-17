import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { MasterService } from "./master.service";

@Controller("master")
export class MasterUpdate {
  constructor(private readonly masterService: MasterService) {}

  
}
