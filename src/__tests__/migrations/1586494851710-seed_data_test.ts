import {MigrationInterface, QueryRunner} from "typeorm";

import { CategoryEntity } from "../category.entity";
import { CommentEntity } from "../comment.entity";
import { PostEntity } from "../post.entity";

let seedDatas = [
    {
        title : "Title 1",
        commments : [
            "comment 1 of post 1",
            "comment 2 of post 1"
        ]
    },
    {
        title : "Title 2",
        commments : [
            "comment 1 of post 2",
            "comment 2 of post 2"
        ]
    },
    {
        title : "Title 3",
        commments : [
            "comment 1 of post 3",
            "comment 2 of post 3"
        ]
    },
    {
        title : "Title 4",
        commments : [
            "comment 1 of post 4",
            "comment 2 of post 4"
        ]
    },
    {
        title : "Title 5",
        commments : [
            "comment 1 of post 5",
            "comment 2 of post 5"
        ]
    },
    {
        title : "Title 6",
        commments : [
            "comment 1 of post 6",
            "comment 2 of post 6"
        ]
    },
    {
        title : "Title 7",
        commments : [
            "comment 1 of post 7",
            "comment 2 of post 7"
        ]
    },
    {
        title : "Title 8",
        commments : [
            "comment 1 of post 8",
            "comment 2 of post 8"
        ]
    },
    {
        title : "Title 9",
        commments : [
            "comment 1 of post 9",
            "comment 2 of post 9"
        ]
    },
    {
        title : "Title 10",
        commments : [
            "comment 1 of post 10",
            "comment 2 of post 10"
        ]
    },
    {
        title : "Title 11",
        commments : [
            "comment 1 of post 11",
            "comment 2 of post 11"
        ]
    },
    {
        title : "Title 12",
        commments : [
            "comment 1 of post 12"
        ]
    },
    {
        title : "Title 13",
        commments : [
            "comment 1 of post 13"
        ]
    },
    {
        title : "Title 14",
        commments : [
            "comment 1 of post 14"
        ]
    },
    {
        title : "Title 15",
        commments : [
            "comment 1 of post 15"
        ]
    }
]

export class seedDataTest1586494851710 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        
        const category1 = await CategoryEntity.create({name: 'category 1'}).save();
        const category2 = await CategoryEntity.create({name: 'category 2'}).save();
        for(let data of seedDatas){
            
            let post = await PostEntity.create({title: data.title, categories: [category1, category2]}).save()
            for (const comment of data.commments) {
                let commentData = {
                    postId: post.id,
                    text: comment
                }
                await CommentEntity.create(commentData).save()
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.clearTable("comment_entity")
        await queryRunner.clearTable("category_entity")
        await queryRunner.clearTable("post_entity")
    }
}
