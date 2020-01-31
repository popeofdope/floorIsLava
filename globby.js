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
                    let st =  g.returnState();
                    
                    return g.players.length < g.maxPlayers && !st.started
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

                if(state.players.length < maxPlayers && state.started === false){
                    return {message:"Not Enough Players To Start",required:maxPlayers,current:state.players.length}
                }

                state.started = true;

                moveFunction(player, move,state)
                return this.returnState();
            }

            this.timeFunction = () => {
                if(state.players.length < maxPlayers  && state.started === false){
                    return {message:"Not Enough Players To Start",required:maxPlayers,current:state.players.length}
                }

                state.started = true;
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
                    if(!game.players.length){
                        lobby.games.splice(lobby.games.indexOf(game),1)
                    }
                    else{
                        game.players.forEach((player) => {
                            io.to(player.id).emit('returnState',game.timeFunction())
                        })
                    }

                })

                console.log(lobby.games.length)
                helperFunctionDelay();
            },100)
        }

        socket.on('disconnect', () => {
            let game  = lobby.games.find((game) =>{
                let isThisIt = false;

                game.players.forEach((player) => {
                    if(player.id === socket.id){
                        isThisIt = true;
                    }
                })

                return isThisIt;
            })

            game.disconnect(socket.id)
        })

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
