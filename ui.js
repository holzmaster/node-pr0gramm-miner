class XMRUI {
	constructor(xmr, autoRedeem, verbose) {
		this.xmr = xmr;
		this.autoRedeem = autoRedeem || false;
		this.verbose = verbose || false;
		this.xmr.logCallback = this.onLogMessage.bind(this);
		this.minRedeemSeconds = 24 * 60 * 60;
		this.sharesToSeconds = .05;
		setInterval(this.update.bind(this), 1e3)
	}
	threadAdd(ev) {
		this.xmr.setNumThreads(this.xmr.threads.length + 1);
		this.elements.threads.textContent = this.xmr.threads.length;
		ev.preventDefault();
		return false
	}
	threadRemove(ev) {
		this.xmr.setNumThreads(this.xmr.threads.length - 1);
		this.elements.threads.textContent = this.xmr.threads.length;
		ev.preventDefault();
		return false
	}
	update() {
		if (!this.last)
			this.last = { hashes: 0 };
		this.current = {
			hashes: 0,
			shares: this.xmr.shares,
		};
		this.current.accepted = this.current.shares > this.last.shares;
		for (var i = 0; i < this.xmr.threads.length; i++)
			this.current.hashes += this.xmr.threads[i].hashesPerSecond
		this.current.hashes = Math.round(this.last.hashes * .5 + this.current.hashes * .5);

		const seconds = this.getSeconds();

		if (this.verbose) {
			console.log("    Hash Rate: %d h/s", this.current.hashes);
			console.log("      Threads: %d", this.xmr.threads.length);
			console.log("       Shares: %d", this.current.shares);
			console.log("Mined Seconds: %d", seconds);
			console.log("-----------------------");
		}
		this.last = this.current;
	}
	getSeconds() {
		return !!this.current ? this.current.shares * this.sharesToSeconds | 0 : 0;
	}
	redeem() {
		xmr.redeem()
	}
	onLogMessage(msg) {
		switch (msg.type) {
			case "job":
				console.log("New job recieved");
				break;
			case "job_accepted":
				console.log("Job was accepted");
				break;
			case "submit":
				console.log("Submitted job solution");
				break;
			case "shares":
				{
					const s = msg.params.shares;
					const sc = s * this.sharesToSeconds | 0;
					console.log("Shares updated: %d (%ds of pr0mium)", s, sc);
					console.log("-----------------------");
				}
				break;
			case "get_shares":
				console.log("Getting shares for user %s", msg.params.user);
				break;
			case "pool_stats":
				console.log("-----------------------");
				console.log("Current pool stats:");
				console.log("Pool Hash Rate: %d h/s", msg.params.hashes | 0);
				console.log("Top users:")
				for (let user of msg.params.toplist)
					console.log("%d h/s\t%s", user.hashes | 0, user.name);
				console.log("-----------------------");
				break;
			default:
				console.dir(msg);
				break;
		}
		if (this.autoRedeem) {
			const redeemThreshold = 86400;
			if (this.getSeconds() > redeemThreshold) {
				this.redeem();
			}
		}
	}
}

module.exports = XMRUI;
