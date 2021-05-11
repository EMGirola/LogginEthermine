const axios = require('axios');

module.exports = class {
    constructor() {
        this.api = process.env.API_ETH;
    }


    async fetchMinerCurrentData(wallet) {
        try {
            return await axios.get(`${this.api}/miner/${wallet}/currentStats`).data;
        } catch (error) {
            console.log('Error trying to get: ', error);
            throw error;
        }
        
    }
}