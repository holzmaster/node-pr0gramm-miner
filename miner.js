#!/usr/bin/env node

const yargs = require("yargs");
const XMR = require("./xmr");
const XMRUI = require("./ui");

const argv = yargs
    .option("user", {
        alias: "u",
        description: "Username",
        required: true,
        type: "string",
    })
    .option("token", {
        alias: "t",
        description: "Token obtained via API endpoint",
        required: true,
        type: "string",
    })
    .option("threads", {
        alias: "j",
        description: "Number of threads to use",
        default: 2,
        type: "number",
    })
    .option("auto-redeem", {
        alias: "a",
        description: "Automatically redeem if possible.",
        default: false,
        type: "boolean",
    })
    .option("verbose", {
        alias: "v",
        description: "Print the status every second.",
        default: false,
        type: "boolean",
    })
    .help()
    .argv;

const wsUrl = "ws://miner.pr0gramm.com:8044";
function main() {
    const { user, token, threads, autoRedeem, verbose } = argv;
    const xmr = new XMR(user, token, wsUrl, threads);
    const ui = new XMRUI(xmr, autoRedeem, verbose);
}
main();