import {
    Column,
    CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";

import { Event } from './Event'

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

    @OneToMany(() => Event, (event) => event.createdBy)
    events: Event[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
