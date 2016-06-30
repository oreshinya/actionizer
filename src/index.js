import EventEmitter from 'eventemitter3';
import debounce from 'lodash.debounce';


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

  const notify = debounce(() => {
    emitter.emit(EMITTER_EVENT, state);
  });

  const getState = () => {
    return state;
  };

  const setState = (nextState) => {
    if (state === nextState) { return; }

    state = nextState;
    notify();
  };

  const dispatch = (action) => {

    const step = (result) => {
      const { done, value } = result;

      if (done) { return; }

      switch (value.type) {
        case PUT_ACTION_EVENT:
          setState(value.nextState);
          step(action.next(state));
          break;
        case CALL_ACTION_EVENT:
          value
            .fn(...value.args)
            .then((val) => { step(action.next(val)); })
            .catch((e) => { step(action.throw(e)); });
          break;
        default:
          throw new Error('yield should receive "call" or "put".');
      }
    };

    step(action.next());
  };

  return {
    subscribe,
    getState,
    dispatch
  };

};
