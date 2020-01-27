const newGame = function(baseState,moveFunction,maxPlayers=2,timeFunction){
    const lobby = function(){
        this.games = [];
        
  
        this.gamesNum = function(){
            return games.length
        }
  
        this.joinGame = function(playerId){
            let ga = this.games.find((g) => {
                return g.players.find((player) => {
                    return player.id == playerId;
                })
            })
  
            if(!ga){
                ga = this.games.find((g) => {
                    return g.players.length < g.maxPlayers;
                })
                if(ga){
                    ga.join(playerId);
                }
            }
            if(!ga){
                ga = new g();
                this.games.push(ga)
                ga.join(playerId)
            }
            return ga.returnState();
        }

        
  
        this.move = function(playerId,move){
            let ga = this.games.find((g) => {
                return g.players.find((player) => {
                    return player.id == playerId;
                })
            })
  
            
            if(!ga){
                return
            }
            
            return ga.move(playerId,move);
        }
    }
  
    function g(){
  
            let state = JSON.parse(JSON.stringify(baseState));
            state.players = this.players;
            
  
            this.playerId = '';
            
            this.maxPlayers = maxPlayers;
            this.players = [];
  
            this.move = (playerId,move) => {
                let player = state.players.find((pl) => {
                    return pl.id == playerId
                })

                if(state.players.length < maxPlayers){
                    return {message:"Not Enough Players to start",required:maxPlayers,current:state.players.length}
                }

                moveFunction(player, move,state)
                return this.returnState();
            }

            this.timeFunction = () => {
                if(state.players.length < maxPlayers){
                    return {message:"Not Enough Players to start",required:maxPlayers,current:state.players.length}
                }
                if(timeFunction != undefined){
                    timeFunction(state)
                }

                return this.returnState();
            }
  
            this.returnState = () => {
                let copyState =  JSON.parse(JSON.stringify(state));
                return copyState
            }
  
            this.join = (playerId) => {
                if(this.players.length < this.maxPlayers){
                    this.players.push({id:playerId,ref:'player'+(this.players.length+1)});
  
                    state.players = this.players;
                    return this.returnState();
                }
                else{
                    return undefined
                }
            }
            this.disconnect = (playerId) => {
                let pl =this.players.find((pl) => {
                    return pl.id == playerId;
                })

                this.players.splice(this.players.indexOf(pl),1);
            }
        }
  
    return lobby
  
  }


module.exports.newGame =  newGame;


module.exports.newIOServer = function newServer(baseState,moveFunction,maxPlayers=2,timeFunction,io){
    let g = newGame(baseState,moveFunction,maxPlayers,timeFunction);
    var lobby = new g();
    io.on('connection', function(socket){
        let helperFunctionDelay = function(){
            setTimeout(()=>{

                lobby.games.forEach((game) => {
                    game.players.forEach((player) => {
                        io.to(player.id).emit('returnState',game.timeFunction())
                    })
                })
                helperFunctionDelay();
            },100)
        }
        helperFunctionDelay();
        lobby.joinGame(socket.id)
        
        socket.on('move', (data) =>{
          let state = lobby.move(socket.id,data);
          state.players.forEach((pl) => {
              io.to(pl.id).emit('returnState', state)
           })
        })
      });
}
