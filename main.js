const express = require("express");
const LogContainer = require('./LogContainer.js');

let container = new LogContainer();

var app = express();
app.use(express.json());


app.get('/', async (req, res) => {

    try {
        
        let newResponse = await container.getAllLogs();
        return res.status(200).send(newResponse);

    } catch (error) {

        return res.status(500).send(error);

    }

});


app.get('/fetchLogs', async (req, res) => {

    try {
        let newResponse = await container.fetchLogs();
        return res.status(200).send(`Fetched ${newResponse} new logs`);
    } catch (error) {
        return res.status(500).send(error);
    }

});


app.post('/add/wallet/:walletId', async (req,res) => {
    let walletId = req.params.walletId;

    if (!walletId) {
        return res.status(400).send('Wallet not found in parameters');
    }

    try {
        await container.addWallet(walletId);
    } catch (error) {
        return res.status(500).send(error);
    }

    return res.status(200).send('Wallet succesfuly created');
});


app.listen(process.env.PORT || 3000, () => {
    console.log("El servidor esta inicializado.");
});