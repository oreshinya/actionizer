import EventEmitter from 'eventemitter3';


const PUT_ACTION_EVENT  = 'ACTIONIZER.ACTION.PUT';
const CALL_ACTION_EVENT = 'ACTIONIZER.ACTION.CALL';

export const put = (nextState) => {
  return {type: PUT_ACTION_EVENT, nextState};
};

export const call = (fn, args) => {
  return {type: CALL_ACTION_EVENT, fn, args};
};


const EMITTER_EVENT = 'ACTIONIZER.EMITTER.NOTIFY';

export const createStore = (initialState) => {
  let state = initialState;
  const emitter = new EventEmitter();

  const subscribe = (listener) => {
    emitter.on(EMITTER_EVENT, listener);

    return () => {
      emitter.removeListener(EMITTER_EVENT, listener);
    };
  };

  const getState = () => {
    return state;
  };

  const setState = (nextState) => {
    if (state === nextState) { return; }

    state = nextState;
    emitter.emit(EMITTER_EVENT, state);
  };

  const dispatch = (actionGenerator) => {

    const step = (result) => {
      const { done, value } = result;

      if (done) { return; }

      switch (value.type) {
        case PUT_ACTION_EVENT:
          setState(value.nextState);
          step(actionGenerator.next(state));
          break;
        case CALL_ACTION_EVENT:
          const promise = value.fn(...value.args);
          promise.then((val) => {
            step(actionGenerator.next(val));
          }).catch((e) => {
            step(actionGenerator.throw(e));
          });
          break;
      }
    };

    step(actionGenerator.next());
  };

  return {
    subscribe,
    getState,
    dispatch
  };

};
