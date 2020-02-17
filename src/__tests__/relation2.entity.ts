import { PrimaryColumn, Entity, ManyToMany } from "typeorm";
import { RelationEntity } from "./relation.entity";

@Entity("relation2s")
export class Relation2Entity {
  @PrimaryColumn()
  id: number;

  @ManyToMany(t => RelationEntity, relation => relation.relation2s)
  relations: RelationEntity[];
}
