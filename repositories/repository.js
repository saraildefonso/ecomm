const fs = require("fs");
const crypto = require("crypto");

module.exports = class Repository {
  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a repo requires a file name");
    }
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, "[]");
    }
  }

  //CREATE
  async create(attrs) {
    attrs.id = this.randomId();
    const records = await this.getAll();
    records.push(attrs);
    await this.writeAll(records);
    return attrs;
  }

  //GETALL
  async getAll() {
    //open this.filename, read, parse and return the content
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
  }

  //WRITEALL
  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  //RANDOMID
  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }

  //GETONE
  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  //DELETE
  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  //UPDATE
  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`${id} not found`);
    }
    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  //GETONEBY
  async getOneBy(filters) {
    const records = await this.getAll();

    //for of --iterate array, for in --iterate obj
    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }
};
