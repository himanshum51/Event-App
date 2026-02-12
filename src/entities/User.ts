import {
    Column,
    CreateDateColumn,
    Entity, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    age: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
