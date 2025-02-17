import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IServiceCreationAttr {
  name: string | undefined;
}

@Table({ tableName: "service" })
export class Service extends Model<Service, IServiceCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
  })
  name: string | undefined;
}
