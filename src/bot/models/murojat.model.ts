import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IMurojatCreationAttr {
  sabrli_id: number | undefined;
  last_state:string | undefined
}

@Table({ tableName: "murojat" })
export class Murojat extends Model<Murojat, IMurojatCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @Column({
    type: DataType.BIGINT,
  })
  sabrli_id: number | undefined;
  @Column({
    type: DataType.STRING(500),
  })
  image: string | null;
  @Column({
    type: DataType.INTEGER,
  })
  age: number | undefined;
  @Column({
    type: DataType.STRING,
  })
  gender: string | undefined;
  @Column({
    type: DataType.INTEGER,
  })
  height: number | undefined;
  @Column({
    type: DataType.STRING,
  })
  size: string | undefined;
  @Column({
    type: DataType.STRING(500),
  })
  item: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  last_state: string | undefined;
}
