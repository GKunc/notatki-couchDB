const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
const express = require('express')
const app = express()
const port = 3000

app.get('/secrets', async (req, res) => {
    const credential = new DefaultAzureCredential();

    const keyVaultName = "notatkikeys";
    const url = "https://" + keyVaultName + ".vault.azure.net";

    const client = new SecretClient(url, credential);
    const secretName = req.query.name;
    const secret = await client.getSecret(secretName);

    res.send(secret.value);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})