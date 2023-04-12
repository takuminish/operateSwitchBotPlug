const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config()

const env = process.env

'use strict';

if (require.main === module) {
    main({ argv: process.argv })
}

async function main(argv) {
    const token = env.TOKEN;
    const secret = env.SECRET;
    const headers = createRequestTokenHeaders(token, secret);

    try {
        const power = await fetchPlugPowerStatus(headers);
        const command = (power === 'on' ? "turnOff" : "turnOn");
        console.log(`${power}=>${command}`)
        postPlugCommands(headers, command);
    } catch (e) {
        console.error(e);
    }
}

function createRequestTokenHeaders(token, secret) {

    const t = Date.now();
    const nonce = "requestID";
    const data = token + t + nonce;
    const signTerm = crypto.createHmac('sha256', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest();
    const sign = signTerm.toString("base64");

    return {
        "Authorization": token,
        "sign": sign,
        "nonce": nonce,
        "t": t,
        'Content-Type': 'application/json',
    }
}

async function fetchPlugPowerStatus(headers) {
    const response = await axios.request({
        baseURL: `https://api.switch-bot.com/v1.1/devices/${env.DEVISEID}/status`,
        method: 'GET',
        headers: headers,
    });

    return response.data.body.power
}

async function postPlugCommands(headers, command) {
    const response = await axios.request({
        baseURL: `https://api.switch-bot.com/v1.1/devices/${env.DEVISEID}/commands`,
        method: 'POST',
        headers: headers,
        data: {
            command: command,
            parameter: "default",
            commandType: "command"
        }
    });

    return response;
}










