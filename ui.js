class XMRUI {
	constructor(xmr, autoRedeem, verbose, silent, quiet, poolStatsInterval) {
		this.xmr = xmr;
		this.autoRedeem = autoRedeem || false;
		this.verbose = verbose || false;
		this.silent = silent;
		this.poolStats = {
			interval: poolStatsInterval,
			lock: true,
			current: {
				hashes: 0,
				toplist: null
			}
		};
		this.xmr.logCallback = this.onLogMessage.bind(this);
		this.minRedeemSeconds = 24 * 60 * 60;
		this.sharesToSeconds = .05;
		if(quiet)
			console.log = () => {};
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
		this.xmr.redeem();
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
			case "redeem":
				console.log("Trying to redeem %i pr0mium seconds...", this.getSeconds());
				break;
			case "redeem_success":
				console.log("Successfully redeemed your pr0mium seconds!");
				break;
			case "redeem_failed":
				console.log("Error while redeeming your pr0mium seconds, retrying...");
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
				let printPoolStats = (hashes, toplist) => {
					console.log("-----------------------");
					console.log("Current pool stats:");
					console.log("Pool Hash Rate: %d h/s", hashes | 0);
					console.log("Top users:")
					for (let user of toplist)
						console.log("%d h/s\t%s", user.hashes | 0, (user.hashes < 1000 ? "\t" : "") + user.name);
					console.log("-----------------------");
				};
				this.poolStats.current.hashes = msg.params.hashes;
				this.poolStats.current.toplist = msg.params.toplist;
				if (!this.silent && !this.quiet) {
					if (this.poolStats.interval === 0)
						printPoolStats(msg.params.hashes, msg.params.toplist);
					else if (this.poolStats.lock) {
						this.poolStats.lock = false;
						setInterval(() => { printPoolStats(this.poolStats.current.hashes, this.poolStats.current.toplist) }, this.poolStats.interval * 1000);
					}
				}
				if (this.autoRedeem && this.getSeconds() > this.minRedeemSeconds)
					this.redeem();
				break;
			default:
				console.dir(msg);
				break;
		}
	}
}

module.exports = XMRUI;
