import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('events')
export class Event {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'time' })
    start_time: Date;

    @Column({ type: 'time' })
    end_time: Date;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ type: 'int' })
    participents_needed: number

    @ManyToOne(() => User, (user) => user.events)
    createdBy: User;

    @Column()
    location: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}