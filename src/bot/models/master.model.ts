import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IMasterCreationAttr {
  id: number | undefined;
  username: string | undefined;
  first_name: string | undefined;
  lang: string | undefined;
  service_id: number | undefined;
}

@Table({ tableName: "masters" })
export class Master extends Model<Master, IMasterCreationAttr> {
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
  lang: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  workshop_name: string;
  @Column({
    type: DataType.STRING,
  })
  address: string;
  @Column({
    type: DataType.STRING,
  })
  address_target: string;
  @Column({
    type: DataType.STRING,
  })
  location: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  start_time: string | undefined;
  @Column({
    type: DataType.STRING,
  })
  end_time: string | undefined;
  @Column({
    type: DataType.INTEGER,
  })
  average_service_time: number | undefined;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_active: boolean;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_verified: boolean;
  @Column({
    type: DataType.STRING,
  })
  last_state: string | undefined;
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  reyting: number | 0;
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  reyting_count: number | 0;
  @Column({
    type: DataType.BIGINT,
  })
  marked_userId: number | undefined;
  @Column({
    type: DataType.INTEGER,
  })
  service_id: number | undefined;
}
