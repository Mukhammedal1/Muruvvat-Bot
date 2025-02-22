import { Column, DataType, Model, Table } from "sequelize-typescript";

interface ISabrliCreationAttr {
  id: number | undefined;
  username: string | undefined;
  lang: string | undefined;
  last_state:string | undefined
}

@Table({ tableName: "sabrli" })
export class Sabrli extends Model<Sabrli, ISabrliCreationAttr> {
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
  lang: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  region: string;
  @Column({
    type: DataType.STRING,
  })
  district: string;
  @Column({
    type: DataType.STRING,
  })
  gender: string;
  @Column({
    type: DataType.INTEGER,
  })
  age: number | undefined;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_active: boolean;
  @Column({
    type: DataType.STRING,
  })
  last_state: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  edit_last_state: string | null;
}
