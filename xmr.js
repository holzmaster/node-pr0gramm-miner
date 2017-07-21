const Worker = require("workerjs");
const WebSocket = require("ws");

class XMRJobThread {
    constructor() {
        this.worker = new Worker("./cryptonight-worker.js");
        this.worker.postMessage("ready");
        this.worker.onmessage = this.onReady.bind(this);
        this.currentJob = null;
        this.jobCallback = function () { };
        this._isReady = false;
        this.hashesPerSecond = 0;
        this.running = false
    }
    onReady(msg) {
        if (msg.data !== "ready" || this._isReady) {
            throw 'Expecting first message to be "ready", got ' + msg
        }
        this._isReady = true;
        this.worker.onmessage = this.onReceiveMsg.bind(this);
        if (this.currentJob) {
            this.running = true;
            this.worker.postMessage(this.currentJob)
        }
    }
    onReceiveMsg(msg) {
        if (msg.data.hash) {
            this.jobCallback(msg.data.nonce, msg.data.hash)
        }
        this.hashesPerSecond = msg.data.hashesPerSecond;
        if (this.running) {
            this.worker.postMessage(this.currentJob)
        }
    }
    setJob(blobHex, targetHex, callback) {
        this.currentJob = {
            blob: blobHex,
            target: targetHex
        };
        this.jobCallback = callback;
        if (this._isReady && !this.running) {
            this.running = true;
            this.worker.postMessage(this.currentJob)
        }
    }
    stop() {
        this.running = false
    }
}

class XMR {
    constructor(user, token, proxyUrl, numThreads) {
        this.user = user;
        this.token = token;
        this.proxyUrl = proxyUrl;
        this.threads = [];
        this.shares = 0;
        this.currentJob = null;
        this.logCallback = function () { };
        this.setNumThreads(numThreads || 0);
        this.connect()
    }
    connect() {
        if (this.socket) {
            return
        }
        this.logCallback({
            notice: "connecting"
        });
        this.socket = new WebSocket(this.proxyUrl);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onClose.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onopen = function () {
            this.send("get_shares", {
                user: this.user
            });
            if (this.currentJob) {
                this.setJob(this.currentJob)
            }
        }.bind(this)
    }
    setNumThreads(num) {
        var num = Math.max(0, num);
        if (num > this.threads.length) {
            for (var i = 0; num > this.threads.length; i++) {
                var thread = new XMRJobThread;
                if (this.currentJob) {
                    thread.setJob(this.currentJob.blob, this.currentJob.target, this.onTargetMet.bind(this, this.currentJob.job_id))
                }
                this.threads.push(thread)
            }
        } else if (num < this.threads.length) {
            while (num < this.threads.length) {
                var thread = this.threads.pop();
                thread.stop()
            }
        }
    }
    onMessage(ev) {
        var msg = JSON.parse(ev.data);
        this.logCallback(msg);
        if (msg.type === "job") {
            this.setJob(msg.params)
        } else if (msg.type === "job_accepted") {
            this.shares = msg.params.shares
        } else if (msg.type === "redeem_success") {
            this.shares = 0
        } else if (msg.type === "redeem_failed") {
            alert("Fehler beim einlösen. Unbekannter User?")
        } else if (msg.type === "shares") {
            this.shares = msg.params.shares
        }
    }
    onClose(ev) {
        for (var i = 0; i < this.threads.length; i++) {
            this.threads[i].stop()
        }
        this.socket = null;
        this.logCallback({
            error: "connection lost"
        });
        setTimeout(this.connect.bind(this), 10 * 1e3)
    }
    setJob(job) {
        this.currentJob = job;
        for (var i = 0; i < this.threads.length; i++) {
            this.threads[i].setJob(job.blob, job.target, this.onTargetMet.bind(this, job.job_id))
        }
    }
    onTargetMet(job_id, nonce, result) {
        this.send("submit", {
            user: this.user,
            job_id: job_id,
            nonce: nonce,
            result: result
        })
    }
    redeem() {
        this.send("redeem", {
            user: this.user,
            token: this.token
        })
    }
    send(type, params) {
        if (!this.socket) {
            return
        }
        var msg = {
            type: type,
            params: params || {}
        };
        this.logCallback(msg);
        this.socket.send(JSON.stringify(msg))
    }
}

module.exports = XMR;
