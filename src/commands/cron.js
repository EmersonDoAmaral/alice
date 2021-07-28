const events = require('events');
const { chattools, Time } = require('../utils');

const emitter = new events.EventEmitter();

function Thread(id, text, message, timer) {
  this.id = id;
  this.description = text.slice(0, 30);
  this.intervalRef = null;
  this.text = text;

  this.start = emitter.on(`start-cron${this.id}`, () => {
    this.intervalRef = setInterval(() => message.reply(this.text), timer);
  });
  this.stop = emitter.on(`stop-cron${this.id}`, () => {
    clearInterval(this.intervalRef);
  });
}

class Cron {
  constructor() {
    this.name = 'cron';
    this.threads = [];
    this.counter = 0;
    this.defaultMessage = `
*criação*: _!cron --create --[time]=<int>_
*outros*: _!cron [--flag] [<int>]_

*argumentos*:
_--create -> cria uma nova thread_
_--destroy -> apaga uma thread_
_--start -> inicia uma thread_
_--stop -> para uma thread_ 
_--s -> define um intervalor de segundos_ 
_--m -> define um intervalor de minutos_ 
_--h -> define um intervalor de horas_ 
_--d  -> define um intervalor de dias_ 

⚠️ *o uso indevido dessa função resultará em ban de 3 dias* ⚠️
    `.trim();
  }

  async execute(data, message) {
    const isAdm = await chattools.isAdm(message);

    if (isAdm) {
      message.reply(this.runs(data, message));
      return;
    }

    message.reply('staff only.');
  }

  create(data, message) {
    const { kwargs, text } = data;
    const timer = Time.timer(
      Math.abs(kwargs.s || 0),
      Math.abs(kwargs.m || 0),
      Math.abs(kwargs.h || 0),
      Math.abs(kwargs.d || 0)
    );

    if (timer <= 0) {
      throw new Error('Time invalid.');
    }

    this.counter += 1;
    const thread = new Thread(this.counter, text, message, timer);
    this.threads.push(thread);

    return `Thread criada usando o id ${thread.id}`;
  }

  destroy(id) {
    if (!this.isIdValid(id)) {
      return 'Thread não encontrada.';
    }

    const thread = this.threads.find((t) => t.id === Number(id));
    this.stop(id);

    emitter.removeAllListeners(`start-cron${id}`, thread.start);
    emitter.removeAllListeners(`stop-cron${id}`, thread.stop);

    this.threads = this.threads.filter((t) => !(t.id === Number(id)));
    return 'Thread destruida com sucesso.';
  }

  start(id) {
    if (this.isIdValid(id)) {
      emitter.emit(`start-cron${id}`);
      return `starting thread ${id}`;
    }

    return 'thread not found';
  }

  stop(id) {
    if (this.isIdValid(id)) {
      emitter.emit(`stop-cron${id}`);
      return `Parando a thread de id ${id}...`;
    }

    return 'Thread não encontrada.';
  }

  log() {
    if (this.threads.length === 0) {
      return 'Nenhuma thread aberta.';
    }

    let output = 'Threads abertas:\n\n';

    this.threads.forEach((t) => {
      output += `id: ${t.id}\ndesc: ${t.description}\n\n`;
    });

    return output.trim();
  }

  runs(data, message) {
    const methods = {
      log: () => this.log(),
      create: () => this.create(data, message),
      destroy: () => this.destroy(data.text),
      start: () => this.start(data.text),
      stop: () => this.stop(data.text),
    };

    if (methods[data.args[0]]) {
      return methods[data.args[0]]();
    }

    return this.defaultMessage;
  }

  isIdValid(id) {
    return this.threads.some((t) => t.id === Number(id));
  }
}

module.exports = Cron;
