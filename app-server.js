const express = require('express');
const socket = require('socket.io');
const path = require('path');
import GameCtrl from './app-server/GameCtrl';
//const emitter = require('./app/EventBus')

const app = express();

app.use(express.static('./app-client'));
app.use(express.static('./node_modules/bootstrap/dist'));

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, './app-client/index.html'), function(err) {
      if (err) {
        res.status(500).send(err)
      }
    })
  })

const server = app.listen(4000, () => console.log('Listening to Requests...'));

const newGame = new GameCtrl();
console.log("Welcome...");

//newGame.nextQuestion();

const io = socket(server);
io.on('connection', (socket) => {
    console.log('Made Socket Connection - ', socket.id);
   
    socket.on('setupNewGame', () => {
        console.log("Setting up a new game...");
        newGame.setupNewGame();
    });            

    socket.on('stopPolling', () => {
        console.log("Stopping polling...");
        newGame.stopPolling();           
    });

    socket.on('nextQuestion', () => {
        console.log("Getting next question...");
        newGame.nextQuestion();       
    });   
    socket.on('endQuestion', () => {
        console.log("Ending question...");
        newGame.endQuestion();       
    });
    
    newGame.on('newPlayer', (data) => {
        console.log("Alerting of new player...");
        socket.emit('newPlayer',data);
    })

    newGame.on('nextQuestion', (data) => {
        console.log("Sending next question...");
        socket.emit('nextQuestion',data);
    })
});





// On start, create new GameCtrl object
// GameCtrl object has to be an EventEmitter
// This server will listen for certain events to transmit through socket to the clients


//quiz.start();
//quiz.startPolling();