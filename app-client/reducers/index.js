import { ADD_PLAYER } from "../constants/action-types";

const initialState = {
    players: []
  };

  function rootReducer(state = initialState, action) {
    if (action.type === ADD_PLAYER) {
        return Object.assign({}, state, {
            players: state.players.concat(action.payload)
          });
    }
    return state;
  };

  export default rootReducer;