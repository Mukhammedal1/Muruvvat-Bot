import { Column, DataType, Model, Table } from "sequelize-typescript";

interface ISahiyCreationAttr {
  id: number | undefined;
  username: string | undefined;
  lang: string | undefined;
  last_state:string | undefined
}

@Table({ tableName: "sahiy" })
export class Sahiy extends Model<Sahiy, ISahiyCreationAttr> {
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
  name: string | undefined;
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
    type: DataType.STRING,
  })
  last_state: string;
  @Column({
    type: DataType.STRING,
  })
  edit_last_state: string;
  
}
