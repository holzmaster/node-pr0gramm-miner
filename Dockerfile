FROM debian:latest

RUN apt-get update && apt-get install -y curl nano git
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN git clone https://github.com/holzmaster/node-pr0gramm-miner.git /root/pr0miner
WORKDIR /root/pr0miner/
RUN npm i

ENTRYPOINT ./miner.js -u $USERNAME -t $TOKEN -j $THREADS -a
