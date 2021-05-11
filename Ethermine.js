const axios = require('axios');

module.exports = class {
    constructor() {
        this.api = process.env.API_ETH;
    }


    async fetchMinerCurrentData(wallet) {
        try {
            let resp = await axios.get(`${this.api}/miner/${wallet}/currentStats`);
            return resp.data;
        } catch (error) {
            console.log('Error trying to get: ', error);
            throw error;
        }
        
    }
}