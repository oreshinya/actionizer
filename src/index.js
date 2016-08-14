import EventEmitter from 'eventemitter3';
import UUID from 'node-uuid';


const SELECT_ACTION_EVENT = 'ACTIONIZER.ACTION.SELECT';
const PUT_ACTION_EVENT    = 'ACTIONIZER.ACTION.PUT';
const CALL_ACTION_EVENT   = 'ACTIONIZER.ACTION.CALL';
const FORK_ACTION_EVENT   = 'ACTIONIZER.ACTION.FORK';
const CANCEL_ACTION_EVENT = 'ACTIONIZER.ACTION.CANCEL';

export const select = () => {
  return {type: SELECT_ACTION_EVENT};
};

export const put = (nextState) => {
  return {type: PUT_ACTION_EVENT, nextState};
};

export const call = (fn, ...args) => {
  return {type: CALL_ACTION_EVENT, fn, args};
};

export const fork = (actionCreator, ...args) => {
  return {type: FORK_ACTION_EVENT, actionCreator, args};
};

export const cancel = (actionId) => {
  return {type: CANCEL_ACTION_EVENT, actionId};
};


const EMITTER_EVENT = 'ACTIONIZER.EMITTER.NOTIFY';

export const createStore = (initialState, notify = (emit) => { emit(); }) => {

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

    notify(() => {
      emitter.emit(EMITTER_EVENT, state);
    });
  };

  const processes = {};

  const dispatch = (action) => {
    const uuid = UUID.v4();
    processes[uuid] = action;

    const step = (result) => {
      const { done, value } = result;

      if (done) {
        delete processes[uuid];
        return;
      }

      switch (value.type) {
        case SELECT_ACTION_EVENT:
          step(action.next(state));
          break;
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
        case FORK_ACTION_EVENT:
          step(action.next(dispatch(value.actionCreator(...value.args))));
          break;
        case CANCEL_ACTION_EVENT:
          if (processes[value.actionId]) {
            processes[value.actionId].return();
            delete processes[value.actionId];
          }
          step(action.next(value.actionId));
          break;
        default:
          step(action.throw(new Error('Received unknown command.')));
          break;
      }
    };

    step(action.next());
    return uuid;
  };

  return {
    subscribe,
    getState,
    dispatch
  };

};
