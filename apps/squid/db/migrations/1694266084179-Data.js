module.exports = class Data1694266084179 {
    name = 'Data1694266084179'

    async up(db) {
        await db.query(`CREATE TABLE "address" ("id" character varying NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "address"`)
    }
}
