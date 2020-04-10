import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { PostEntity } from "./post.entity";

@Entity('comment_entity')
export class CommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  text: string;

  @Column()
  postId: number

  @ManyToOne(type => PostEntity, post => post.comments)
  post: PostEntity;
}
