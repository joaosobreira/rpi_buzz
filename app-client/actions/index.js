import { ADD_PLAYER, NEXT_QUESTION } from "../constants/action-types";

export function addPlayer(payload) {
    return { type: ADD_PLAYER, payload }
};

export function nextQuestion(payload) {
    return { type: NEXT_QUESTION, payload }
};