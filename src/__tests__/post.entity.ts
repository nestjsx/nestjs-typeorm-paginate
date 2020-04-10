import { BaseEntity, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { CategoryEntity } from "./category.entity";
import { CommentEntity } from "./comment.entity";

@Entity('post_entity')
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  title: string;

  @ManyToMany(type => CategoryEntity)
  @JoinTable()
  categories: CategoryEntity[];
    
  @OneToMany(type => CommentEntity, comment => comment.post)
  comments: CommentEntity[];
}
