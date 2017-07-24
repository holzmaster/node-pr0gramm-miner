# pr0gramm-miner
Headless-Miner für das pr0gramm.

## Voraussetzungen
- Node.js >= 8
- npm
- Internet
- pr0gramm-Account
- Oder: Docker/docker-compose + git

## Installation
```Shell
git clone https://github.com/holzmaster/node-pr0gramm-miner
cd node-pr0gramm-miner
npm i
```

### Mit Docker/docker-compose
```Shell
git clone https://github.com/holzmaster/node-pr0gramm-miner
cd node-pr0gramm-miner
# docker-compose.yml anpassen
sudo docker-compose build
sudo docker-compose run
```

## Start
```Shell
./miner.js -u <username> -t <token> [--num-threads X]
```
- Das `<token>` muss über den API-Endpoint [`/api/user/minerauth`](https://pr0gramm.com/api/user/minerauth) geholt werden.

Alles:
```
$ ./miner.js --help
Options:
  --user, -u         Username                                [string] [required]
  --token, -t        Token obtained via API endpoint         [string] [required]
  --threads, -j      Number of threads to use              [number] [default: 2]
  --auto-redeem, -a  Automatically redeem if possible.[boolean] [default: false]
  --verbose, -v      Print this status every second.  [boolean] [default: false]
  --help             Show help                                         [boolean]
```

Getestet unter Linux (Debian). KA ob es mit Windows funktioniert (wäre dann `node miner.js` statt `./miner.js`).