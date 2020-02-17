import { PrimaryColumn, Entity, ManyToMany, JoinTable } from "typeorm";
import { Relation2Entity } from "./relation2.entity";

@Entity("relations")
export class RelationEntity {
  @PrimaryColumn()
  id: number;

  @ManyToMany(t => Relation2Entity, relation2 => relation2.relations)
  @JoinTable({ name: "relation_relations" })
  relation2s: Relation2Entity[];
}
