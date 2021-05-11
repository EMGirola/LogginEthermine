module.exports = class {
    constructor(unpaid, ash, createdDate) {
        this.unpaidBalance = unpaid;
        this.averageHashrate = ash;
        this.createdDate = createdDate;
    }
}
//CREATE TABLE  log_table (log_id serial PRIMARY KEY, wallet varchar(100) UNIQUE, unpaid_balance bigint, average_hashrate double precision, created_date date );