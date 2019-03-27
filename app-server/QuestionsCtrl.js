var fs = require('fs');

export default class QuestionCtrl {

    // Ideal seria colocar isto assíncrono
    loadAllQuestions() {
        let filecontent = fs.readFileSync(__dirname + '/questionList.json', 'utf8')
        let data = JSON.parse(filecontent.toString());
        return this.randomize(data);
    }

    randomize(data) {
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
        }
        return data;
    }

    setupAnswerMap(answerArray,correctAnswer) {
        let answerMap =  new Map();
        let correctPosition = Math.floor(Math.random()*4+1);
        let shuffledAnswerArray = this.randomize(answerArray);
        let j = 0;

        answerMap.set(correctPosition,correctAnswer);
        for(let i = 1; i < 5; i++){
            if(i!=correctPosition){
                answerMap.set(i,shuffledAnswerArray[j]);
                j++;
            }
        }

        let answerObject = {
            "correctPosition": correctPosition,
            "answerMap": answerMap
        }

        return answerObject;
    }
}
