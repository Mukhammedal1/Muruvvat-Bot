import { IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;
  phone_number: string;
}
