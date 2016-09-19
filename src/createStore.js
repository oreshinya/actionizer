import EventEmitter from 'eventemitter3';
import uuid from 'node-uuid';

import { CALL, FORK, REDUCE, CANCEL, SELECT } from './CommandTypes';

const EMIT = 'ACTIONIZER.EMITTER.NOTIFY';

export default (initialState, notify = (emit) => { emit(); }) => {
  let state = initialState;
  const emitter = new EventEmitter();
  const processes = {};

  const subscribe = (listener) => {
    emitter.on(EMIT, listener);
    return () => { emitter.removeListener(EMIT, listener); };
  };

  const emit = () => {
    emitter.emit(EMIT, state);
  };

  const getState = () => {
    return state;
  };

  const setState = (nextState) => {
    if (state !== nextState) {
      state = nextState;
      notify(emit);
    }
    return state;
  };

  const openProcess = (action) => {
    const actionId = uuid.v4();
    processes[actionId] = action;
    return actionId;
  };

  const closeProcess = (actionId) => {
    if (!processes[actionId]) { return; }
    processes[actionId].return();
    delete processes[actionId];
  };

  const dispatch = (action) => {
    const actionId = openProcess(action);

    const step = (result) => {
      const { done, value } = result;

      if (done) { return closeProcess(actionId); }

      switch (value.type) {
        case SELECT:
          step(action.next(value.selector(state)));
          break;
        case REDUCE:
          step(action.next(setState(value.reducer(state))));
          break;
        case CALL:
          value
            .fn(...value.args)
            .then((val) => { step(action.next(val)); })
            .catch((e) => { step(action.throw(e)); });
          break;
        case FORK:
          step(action.next(dispatch(value.actionCreator(...value.args))));
          break;
        case CANCEL:
          closeProcess(value.actionId);
          step(action.next());
          break;
        default:
          step(action.throw(new Error('Received unknown command.')));
          break;
      }
    };

    step(action.next());
    return actionId;
  };

  return {
    subscribe,
    getState,
    dispatch
  };
};
