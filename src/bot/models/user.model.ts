import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IUserCreationAttr {
  id: number | undefined;
  username: string | undefined;
  first_name: string | undefined;
  lang: string | undefined;
}

@Table({ tableName: "users" })
export class User extends Model<User, IUserCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
  })
  username: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  first_name: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  phone_number: string;
  @Column({
    type: DataType.STRING,
  })
  lang: string;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_active: boolean;
  @Column({
    type: DataType.STRING,
  })
  location: string;
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  marked: number|0
}
