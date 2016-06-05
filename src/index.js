import EventEmitter from 'eventemitter3';

const EVENT_NAME = 'ACTIONIZER_STORE.NOTIFY';

export const createStore = (initialState) => {
  let state = initialState;
  const emitter = new EventEmitter();

  const subscribe = (listener) => {
    emitter.on(EVENT_NAME, listener);

    return () => {
      emitter.removeListener(EVENT_NAME, listener);
    };
  };

  const getState = () => {
    return state;
  };

  const next = (nextState) => {
    if (state !== nextState) {
      state = nextState;
      emitter.emit(EVENT_NAME, state);
    }
  };

  const actionize = (action) => {
    return action(next, getState);
  };

  return {
    subscribe,
    getState,
    actionize
  };
};
