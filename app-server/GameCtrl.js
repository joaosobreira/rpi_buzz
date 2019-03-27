// ---- TODO -------
// Will change name to GameCtrl
// Will extend EventEmitter
// Methods (public access):
// .end() - ends the game
// .addPlayer()
// .removePlayer()
// .editPlayer()
// .selectGameMode()
// .startGame()
// .answerQuestion()
// .markAnswerAsRight()
// .markAnswerAsWrong()
// .timesUp()
// .nextQuestion()

// Methods (private access):
// .setupGameContent()
// .lightRemote(X)
// .ignoreBtnPressed() ???

// Events (output)
// btnPressed: payload {player, answer}
// rightAnswer: payload {player, answer}
// wrongAnswer: payload {player, answer}
// currentGameStatus: payload {currentQuestion, score}


import RemoteCtrl from "./RemoteCtrl";
import EventEmitter from "events";
import QuestionsCtrl from "./QuestionsCtrl"

import constants from './constants';
const ctrl_btns = [constants.BTN_RED, constants.BTN_BLUE, constants.BTN_ORANGE, constants.BTN_GREEN, constants.BTN_YELLOW];


export default class GameCtrl extends EventEmitter {

    constructor(){
        super();
        this.rmtCtrl = new RemoteCtrl();
        this.qstCtrl = new QuestionsCtrl();
        // Set Default State
        this.players = new Map();
        this.qList = [];
        this.currentQuestion = 1;
        this.qList = this.qstCtrl.loadAllQuestions();
        this.answers = new Map();
        //console.log(this.qList);
    }

    async setupNewGame(){
        console.log("[GAMECTRL] - Setting up new game. Waiting for players...")
        this.startPolling(this.addPlayer.bind(this),10); 
    }

    startPolling(cb) {
        console.log('[GAMECTRL] - Start polling for remote activity...');
        console.log('[GAMECTRL] - Callback: ',cb.name);
        this.rmtCtrl.startPolling();
        this.rmtCtrl.on('press', (data) => {
            console.log('[GAMECTRL] - Receiving button press: ',data);
            cb(data);
        })   
    }

    stopPolling() {
        console.log('[GAMECTRL] - Stoping polling...');
        this.rmtCtrl.stopPoll();
        console.log('[GAMECTRL] - Polling stopped!');
        this.rmtCtrl.removeAllListeners('press');
    }

    addPlayer(data) {
        console.log("[GAMECRTL] Data received by addPlayer: ",data);
        if (!this.players.has(data.ctrl)){
            this.players.set(
                data.ctrl,
                {"name":"Player "+(this.players.size+1),
                "points":0});
            console.log("[GAMECRTL] Player ",this.players.get(data.ctrl).name," added");
            console.log("[GAMECRTL] Players in game: ", ...this.players);
            this.rmtCtrl.setLightOn(data.ctrl-1);
            this.emit("newPlayer",data.ctrl);
        } 
    }

    answerQuestion(data) {
        console.log("[GAMECRTL] Data received by answerQuestion: ",data);
        if(this.players.has(data.ctrl) && !this.answers.has(data.ctrl) && data.btn!=0){
            this.answers.set(data.ctrl,data.btn);
            console.log("[GAMECRTL] Player ",this.players.get(data.ctrl).name," answered ",this.answers.get(data.ctrl));
        }
    }

    nextQuestion(){
        if(this.currentQuestion==this.qList.size){
            console.log("[GAMECTRL] Nome more questions left");
            return
        }
        this.answers.clear();

        let options = this.qstCtrl.setupAnswerMap(this.qList[this.currentQuestion-1].qOpt,this.qList[this.currentQuestion-1].qAnswer);
        this.currentCorrectAnswer = options.correctPosition;

        // Question data: currentQuestion + qText + qOptions
        let questionData = {
            "currentQuestion": this.currentQuestion,
            "questionText": this.qList[this.currentQuestion-1].qText,
            "questionOptions": JSON.stringify([...options.answerMap]),
            "correctOption": options.correctPosition
        }
        console.log('[GAMECTRL]: Question Data: ',questionData);
        this.emit('nextQuestion',questionData)
        //console.log("[GAMECTRL] - Question ",this.currentQuestion,": ",this.qList[this.currentQuestion-1].qText);
        //for(let i=1; i<5; i++){
        //    console.log("[GAMECTRL] - Option ",i,": ",options.answerMap.get(i));
        //}
        this.startPolling(this.answerQuestion.bind(this),10);
        console.log("[GAMECRTL] Waiting for players to answer...");
    }

    endQuestion() {
        this.stopPolling();
        console.log("[GAMECRTL] Correct Answer: ",this.currentCorrectAnswer);
        console.log("[GAMECRTL] Answers: ");
        for(const i of this.answers.keys()){
            console.log("[GAMECRTL] ",this.players.get(i).name," answered ",this.answers.get(i));
            if(this.answers.get(i)==this.currentCorrectAnswer){
                this.players.get(i).points++;
            }
        }
        console.log("[GAMECRTL] Points: ",);
        for(const j of this.players.keys()){
            console.log("[GAMECRTL] ",this.players.get(j).name," has ",this.players.get(j).points," points");
        }
        this.currentQuestion=this.currentQuestion+1;
    }

}