module.exports = class {
    constructor(wallet) {
        this.wallet = wallet;
        this.logs = [];
    }


    setLogs(logs) {
        this.logs = logs;
    }

    getWallet(){
        return this.wallet;
    }
}

// CREATE TABLE  wallet (wallet_id serial PRIMARY KEY, wallet varchar(100) UNIQUE, created_date date );
