const { EventEmitter } = require('events');

const emitter = new EventEmitter();

let state = {
  status: 'connecting',
  qr: null,
  number: null,
};

function getState() {
  return state;
}

function setState(patch) {
  state = { ...state, ...patch };
  emitter.emit('update', state);
}

function onUpdate(listener) {
  emitter.on('update', listener);
  return () => emitter.off('update', listener);
}

module.exports = { getState, setState, onUpdate };
