require('dotenv').config();
const { Alice } = require('./src/Alice');
const {
  About,
  Coin,
  Commands,
  Cron,
  Links,
  Lyric,
  Report,
  Search,
  Suggest,
  Wiki,
} = require('./src/commands');

const alice = new Alice([
  new About(),
  new Coin(),
  new Commands(),
  new Cron(),
  new Links(),
  new Lyric(),
  new Report(),
  new Search(),
  new Suggest(),
  new Wiki(),
]);

alice.init();
