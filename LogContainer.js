const { Pool } = require('pg');


const Log = require('./LogClass.js');
const Wallet = require('./WalletClass');
const Ethermine = require('./Ethermine.js');
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
    // CREATE TABLE  log_table (log_id serial PRIMARY KEY, wallet varchar(100), unpaid_balance bigint, average_hashrate double precision, created_date date );

    async fetchLogs() {
        let cont = 0;

        try {
            
            let rawWallets = await this.pool.query('SELECT wallet from wallet');
            let wallets = this.convertRawToWallet(rawWallets.rows);
            

            for (const wall of wallets) {
                let rawData = await ethermine.fetchMinerCurrentData(wall.getWallet());
                console.log('RawData of axios: ', rawData);

                if(rawData.status 
                    && rawData.status == 'OK'
                    && rawData.data
                    && rawData.data.time
                    ) {

                    let unpaid = rawData.data.unpaid;
                    let averageHashrate = rawData.data.averageHashrate;
                    let values = [wall.getWallet(), unpaid, averageHashrate, new Date().toLocaleString("es-ES", { timeZone: 'America/Argentina/Buenos_Aires'})];
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
        let rawWallets;

        try {
            
            rawWallets = await this.pool.query('Select wallet_id, wallet from wallet WHERE wallet = ($1)', [wallId]);

        } catch (error) {
            console.log('Error fetching account: ', error);
            throw 'Cannot fetch account by wallId: '+ wallId;
        }

        return rawWallets.rows || [];
    }

    async addWallet(wallId) {
        try {

            let postSqlDate = convertDate(new Date());

            await this.pool.query('INSERT INTO wallet(wallet, created_date) values ($1, to_timestamp($2))', [wallId, postSqlDate]);
            
        } catch (error) {
            console.log('Error inserting new wallet: ', error);
            throw error;
        }

        return 'Sucesfully created wallet with id: ' + wallId;
    }

    async removeWallet(id, wallet) {
        try {
            await this.pool.query('DELETE FROM log_table WHERE wallet = ($1)', [wallet]);
            await this.pool.query('DELETE FROM wallet WHERE wallet_id = ($1)', [id]);

        } catch(error) {
            console.log('Error trying to delete wallet: ', error);
            throw error;
        }

    }

    async deleteAllLogs(){
        try {
            await this.pool.query('DELETE FROM log_table');
        } catch (error) {
            console.log('Error trying to delete all logs');
            throw 'Error trying to delete logs';
        }
    }



    async getAllLogs() {
        let wallets;

        try {
            let rawWallets = await this.pool.query('SELECT wallet from wallet');
            wallets = this.convertRawToWallet(rawWallets.rows);

            for (const wallet of wallets) {
                let rawLogs = await this.pool.query(`SELECT unpaid_balance, average_hashrate, created_date FROM log_table WHERE log_table.wallet = '${wallet.getWallet()}'`)
                let logs = this.convertRawToLogs(rawLogs.rows);
                wallet.logs = logs;
            }


        } catch (error) {
            console.log('Error fetching logs:', error);
            throw 'Error fetching logs';
        }

        return wallets;
    }


    convertRawToWallet(rawWallet) {
        let wallets = [];

        rawWallet.forEach(wall => {
            try {
                wallets.push(new Wallet(wall.wallet));
            } catch (error) {
                console.log('Failed to convert rawData to wallet: ', error);
            }
        })

        return wallets;
    }

    convertRawToLogs(rawLogs) {
        let logs = [];

        try {
            rawLogs.forEach(log => {
                let date = new Date(log['created_date']);
                date.setMinutes(0,0,0);

                logs.push(new Log((log['unpaid_balance'] / 10e17), log['average_hashrate'], date));
            })
        } catch (error) {
            console.log('Failed to convert rawLog to Log: ', error);
        }

        return logs;
    }

    convertDate(date) {
        date.setMinutes(0,0,0);
        return date.getTime() / 1000.0;
    }
}