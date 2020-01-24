const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const newG = require('./globby').newIOServer;


app.use('/static', express.static('public'))

let squareHealth = 5;
newG({
    map:[[{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}],
         [{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth},{health:squareHealth}]],
    playersArray:[
      {player:'player1', position:{x:0,y:0},death:false},
      {player:'player2', position:{x:5,y:5},death:false},
      /* {player:'player3', position:{x:7,y:7},death:false},
      {player:'player4', position:{x:3,y:3},death:false},
      {player:'player5', position:{x:9,y:9},death:false}, */
    ],
    breakTimer:5
},
function(player,move,state){
  let pl = state.playersArray.find((pl) => {
    return pl.player == player.ref;
  });
  let playersArray = state.playersArray
  if (pl.death) {
    return
  }
  switch(move){
    case 'left': 
      if(pl.position.x > 0){
        let freePosCheck = true;
        playersArray.forEach((innerPl) => {
          if(innerPl.position.x == pl.position.x-1 && innerPl.position.y == pl.position.y){
            freePosCheck = false;
          }
        })
        if(freePosCheck){
          pl.position.x -=1;
        }
      }
      break;
    case 'right': 


      if(pl.position.x < 9){
        let freePosCheck = true;
        state.playersArray.forEach((innerPl) => {
          if(innerPl.position.x == pl.position.x+1 && innerPl.position.y == pl.position.y){
            freePosCheck = false;
          }
        })
        if(freePosCheck){
          pl.position.x +=1;
        }
      }
      break;
    case 'down': 


      if(pl.position.y < 9){
        let freePosCheck = true;
        state.playersArray.forEach((innerPl) => {
          if(innerPl.position.y == pl.position.y+1 && innerPl.position.x == pl.position.x){
            freePosCheck = false;
          }
        })
        if(freePosCheck){
          pl.position.y +=1;
        } 
      }
      break;
      case 'up': 
        if(pl.position.y > 0){
          let freePosCheck = true;
          state.playersArray.forEach((innerPl) => {
            if(innerPl.position.y == pl.position.y-1 && innerPl.position.x == pl.position.x){
              freePosCheck = false;
            }
          })
          if(freePosCheck){
            pl.position.y -=1;
          }
        }
        break;
}


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
      state.breakTimer = 5;
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