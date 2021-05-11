const { Pool } = require('pg');
const Ethermine = require('ethermine-api'); // use ethermine-api in production


const Log = require('./LogClass.js');
const Wallet = require('./WalletClass');

const ethermine = new Ethermine();


module.exports = class {
    

    constructor(){
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
    }

    // CREATE TABLE  wallet (wallet_id serial PRIMARY KEY, wallet varchar(100) UNIQUE, created_date date );
    // CREATE TABLE  log_table (log_id serial PRIMARY KEY, wallet varchar(100) UNIQUE, unpaid_balance bigint, average_hashrate double precision, created_date date );

    async fetchLogs() {
        try {
            
            let rawWallets = await this.pool.query('SELECT wallet from wallet');
            let wallets = this.convertRawToWallet(rawWallets.rows);
            let cont = 0;

            for (const wall of wallets) {
                let rawData = await this.asPromise(this, ethermine.getMinerCurrentStats, wall.getWallet());
                
                if(rawData.status && rawData.status == 'OK') {
                    let unpaid = rawData.data.unpaid;
                    let averageHashrate = rawData.data.averageHashrate;
                    let values = [wall.getWallet(), unpaid, averageHashrate, new Date()];
                    this.pool.query('INSERT INTO log_table(wallet, unpaid_balance, average_hashrate, created_date) values ($1, $2, $3, $4)', values);
                    cont++;
                }
            }

        } catch (error) {
            console.log('Error fetching logs: ', error);
            throw 'Error fetching logs';
        }

        return cont;
    }

    async fetchWalletById(wallId) {
        let rawWallet;

        try {
            
            rawWallets = await this.pool.query('Select wallet_id from wallet WHERE wallet = ($1)', [wallId]);

        } catch (error) {
            console.log('Error fetching account: ', error);
            throw 'Cannot fetch account by wallId: '+ wallId;
        }

        return rawWallet.rows || [];
    }

    async addWallet(wallId) {
        try {

            await this.pool.query('INSERT INTO wallet(wallet, created_date) values ($1, $2)', [wallId, new Date()]);
            
        } catch (error) {
            console.log('Error inserting new wallet: ', error);
            throw error;
        }

        return 'Sucesfully created wallet with id: ' + wallId;
    }


    async getAllLogs() {
        let logs;

        try {
            let rawWallets = await this.pool.query('SELECT wallet from wallet');
            let wallets = this.convertRawToWallet(rawWallets.rows);

            for (const wallet of wallets) {
                let rawLogs = await this.pool.query(`SELECT unpaid_balance, average_hashrate created_date FROM log_table where wallet = ${wallet.getWallet()}`)
                let logs = this.convertRawToWallet(rawLogs);
                wallet.logs = logs;
            }


        } catch (error) {
            console.log('Error fetching logs:', error);
            throw 'Error fetching logs';
        }

        return logs;
    }


    convertRawToWallet(rawWallet) {
        let wallets = [];

        rawWallet.forEach(wall => {
            try {
                wallets.add(new Wallet(wall.wallet));
            } catch (error) {
                console.log('Failed to convert rawData to wallet: ', wall);
            }
        })

        return wallets;
    }

    convertRawToLogs(rawLogs) {
        let logs = [];

        try {
            rawLogs.forEach(log => {
                logs.add(new Log(log.unpaid_balance, log.average_hashrate, log.created_date));
            })
        } catch (error) {
            console.log('Failed to convert rawLog to Log: ', log);
        }

        return logs;
    }



    async asPromise(context, callbackFunction, ...args) {
        return new Promise((resolve, reject) => {
            args.push((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
            if (context) {
                callbackFunction.call(context, ...args);
            } else {
                callbackFunction(...args);
            }
        });
    }

}