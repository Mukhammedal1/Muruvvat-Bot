import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IMuruvvatCreationAttr {
  sahiy_id: number | undefined;
  sabrli_id: number | undefined;
  who_for: string | undefined;
  item: string | undefined;
  last_state:string | undefined
}

@Table({ tableName: "muruvvat" })
export class Muruvvat extends Model<Muruvvat, IMuruvvatCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @Column({
    type: DataType.STRING(500),
  })
  who_for: string | undefined;
  @Column({
    type: DataType.STRING(500),
  })
  item: string | undefined;
  @Column({
    type: DataType.BIGINT,
  })
  sabrli_id: number | undefined;
  @Column({
    type: DataType.BIGINT,
  })
  sahiy_id: number | undefined;
  @Column({
    type: DataType.STRING,
  })
  last_state: string | undefined;
}
