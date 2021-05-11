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
        console.log('Error processing: ', error);
        return res.status(500).send(error);
    }

});


app.post('/add/wallet/:walletId', async (req,res) => {
    let walletId = req.params.walletId;

    if (!walletId) {
        return res.status(400).send('Wallet not found in parameters');
    }

    let wallets = await container.fetchWalletById(walletId);

    if(wallets.length > 0) {
        return res.status(400).send('Wallet already exists');
    }

    try {
        await container.addWallet(walletId);
    } catch (error) {
        return res.status(500).send(error);
    }

    return res.status(200).send('Wallet succesfuly created');
});

app.delete('/remove/wallet/:walletId', async (req,res) => {
    let walletId = req.params.walletId;

    if (!walletId) {
        return res.status(400).send('Wallet not found in parameters');
    }

    let wallets = await container.fetchWalletById(walletId);

    if(wallets.length > 1 || wallets.length == 0) {
        return res.status(404).send('Wallet not found');
    }

    try {
        await container.removeWallet(wallets[0].wallet_id, wallets[0].wallet);
        return res.status(200).send('Wallet succesfuly deleted');
    } catch (error) {
        return res.status(500).send('Error happen trying to delete the wallet with id: ', wallets[0].wallet_id);
    }

})

app.delete('/remove/logs/all', async (req, res) => {
    try {
        await container.deleteAllLogs();
        return res.status(200).send('Sucesfully deleted all logs');

    } catch (error) {
        return res.status(500).send(error);
    }
})


app.listen(process.env.PORT || 3000, () => {
    console.log("El servidor esta inicializado.");
});