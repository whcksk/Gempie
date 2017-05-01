var log = require('../config/tempLog');
var fs = require('fs');
var listDB = require('./mDB');
var beforeList = [];
var sortedList = [];
for(var k=0;k<=9;k++){
	beforeList[k] = [null, null];
}


module.exports = function(app){
	app.io = require('socket.io')();
	// userlist에 등록시 여기에도 등록
	// username : {'한국':[a,b,c,d,e,f], 'room' : {'username':'username', 'username2':'username2'}, 

	app.io.sockets.on('connection', function(socket){
		socket.on('addUser', function(username, room){
			sortedList = listDB.insert(room, username);
			socket.username = username;
			socket.room = room;
			socket.join(room);

			socket.broadcast.to(room).emit('chatEmit', 'SERVER', username + ' has connected to ' + room);
			if(isChangedList()){
				app.io.sockets.emit('updateCityList', sortedList);	
			}
			app.io.sockets.in(room).emit('updatePopu', listDB.getPop(room));
			
			// echo to client they've connected
			
			// echo to room 1 that a person has connected to their room
			
			// socket.emit('updaterooms', app.io.rooms, 'room1'); // ???
			// socket.broadcast.to(room).emit('updateCityList', sortedList);  이렇게 보내면 나 빼고 전부에게 보내기
			// socket.broadcast.to(room).emit('updatePopu', listDB.getPop(room));
		});
		socket.on('disconnect', function(){

		});
		socket.on('sendchat', function (data) {
		// we tell the client to execute 'chatEmit' with 2 parameters
			app.io.sockets.in(socket.room).emit('chatEmit', socket.username, data);
		});
	}); 
	// 리스너 만들어서 sortedList 가 변경이 되었을 때 app.io.sockets.emit('updateCityList', sortedList);
}
function isChangedList(){
	var isChanged = false;
	var i;
	for(i=0; i<=9; i++){
		if(sortedList[i]){

			if(!(sortedList[i][0]===beforeList[i][0] && sortedList[i][1]===beforeList[i][1])){
				isChanged = true;
				break;
			}
		}else{
			if(beforeList[i][0]){
				isChanged = true;
			}
			break;
		}
	}
	if(isChanged){
		for(var j=i; j<=9; j++){
			if(sortedList[j]){
				beforeList[j] = sortedList[j];
			}else{
				beforeList[j] = null;
			}
		}
	}
	return isChanged;
}