import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IBronTimeCreationAttr {
  user_id: number | undefined;
  master_id: number | undefined;
  bron_time: string | undefined;
  day: string | undefined;
}

@Table({ tableName: "bron_time" })
export class BronTime extends Model<BronTime, IBronTimeCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @Column({
    type: DataType.BIGINT,
  })
  user_id: number | undefined;
  @Column({
    type: DataType.BIGINT,
  })
  master_id: number | undefined;
  @Column({
    type: DataType.STRING,
  })
  bron_time: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  day: string | undefined;
}
