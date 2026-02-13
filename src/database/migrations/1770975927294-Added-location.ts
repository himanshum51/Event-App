import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedLocation1770975927294 implements MigrationInterface {
    name = 'AddedLocation1770975927294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "location" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "location"`);
    }

}
