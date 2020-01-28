const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const newG = require('./globby').newIOServer;


app.use('/static', express.static('public'))

let squareHealth = 5;
let breakTimer = 12;
let rows =5;
let columns = 5;

let map = [];

for(let r = 0; r<rows+1;r++){
  map.push([])
  for(let c = 0; c<columns+1;c++){
    map[r].push({health:squareHealth})
  }
}

let moveIt = function(player,move,state){
  let pl
  
  if(player.ref){
    pl = state.playersArray.find((pl) => {
      return pl.player == player.ref;
    });
  }
  else{
    pl = player;
  }

  if (pl.death) {
    return
  }

  switch(move){
      case 'left': 
        if(pl.position.x > 0){
            pl.position.x -=1;
        }
        else{
          pl.position.x = columns
        }
      break;

      case 'right': 
        if(pl.position.x < columns){
            pl.position.x +=1;
        }
        else{
          pl.position.x = 0
        }
      break;
      case 'down': 
        if(pl.position.y < rows){
          pl.position.y +=1;
        }
        else{
          pl.position.y = 0
        }
      break;

      case 'up': 
        if(pl.position.y > 0){
          pl.position.y -=1;
        }
        else{
          pl.position.y = rows
        }
      break;
  }

  let plSitting  = state.playersArray.find((innerPl) => {
      return innerPl.position.x == pl.position.x && innerPl.position.y == pl.position.y &&  innerPl != pl
  })
  if(plSitting){
    moveIt(plSitting,move,state)
  }
}

newG({
    map:map,
    playersArray:[
      {player:'player1', position:{x:0,y:0},death:false},
      {player:'player2', position:{x:5,y:5},death:false},
      /* {player:'player3', position:{x:7,y:7},death:false},
      {player:'player4', position:{x:3,y:3},death:false},
      {player:'player5', position:{x:9,y:9},death:false}, */
    ],
    breakTimer:breakTimer,
    started:false
},
function(player,move,state){

    moveIt(player,move,state)

    //State Change on Move
},
2, // Number Of Players
function(state){
    //State Change on Time
    state.playersArray.forEach((pl) => {
      if(state.map[pl.position.x]){
        if(state.map[pl.position.x][pl.position.y]){
          if(state.map[pl.position.x][pl.position.y].health <=0){
            pl.death = true;
          }
        }
      }
    })
    if(state.breakTimer < 0) {
      state.breakTimer = breakTimer;
      const row = state.map[Math.floor(Math.random()*state.map.length)];
      const col = row[Math.floor(Math.random()*row.length)]
      if(col.health > 0){
        col.health -=1;
      }
    }
    else{
      state.breakTimer -=1;
    }



},
io
)



app.get('/', function(req, res){
    return res.status(200).sendFile(__dirname + '/index.html');
  });




http.listen(3000, function(){
  console.log('listening on *:3000');
});