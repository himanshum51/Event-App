import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileFieldsToEvent1739695454000 implements MigrationInterface {
    name = 'AddFileFieldsToEvent1739695454000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "events" ADD "files" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "files"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "image"`);
    }

}
