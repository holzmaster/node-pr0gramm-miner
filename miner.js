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
    .option("silent", {
        alias: "s",
        description: "Supresses pool stats output.",
        default: false,
        type: "boolean"
    })
    .option("quiet", {
        alias: "q",
        description: "Hides all output.",
        default: false,
        type: "boolean"
    })
    .option("pool-stats-interval", {
        description: "Set the interval in which the pool stats should be printed in seconds.",
        default: 0,
        type: "number"
    })
    .help()
    .argv;

const wsUrl = "ws://miner.pr0gramm.com:8044";
function main() {
    const { user, token, threads, autoRedeem, verbose, silent, quiet, poolStatsInterval } = argv;
    const xmr = new XMR(user, token, wsUrl, threads);
    const ui = new XMRUI(xmr, autoRedeem, verbose, silent, quiet, poolStatsInterval);
}
main();
