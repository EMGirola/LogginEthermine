const axios = require('axios');

module.exports = class {
    constructor(API) {
        this.api = API || process.env.API_ETH;
    }


    async fetchMinerCurrentData(wallet) {
        try {
            return await axios.get(`${this.api}/miner/${wallet}/currentStats`);
        } catch (error) {
            console.log('Error trying to get: ', error);
            throw error;
        }
        
    }
}