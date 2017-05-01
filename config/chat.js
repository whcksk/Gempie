// var log = require('../config/tempLog');
var fs = require('fs');
var listDB = require('./mDB');
var beforeList = [];
var sortedList = [];
var logDB = require('./mDB2');
var mongoLog = require('./mongoLog_b');

for(var k=0;k<=9;k++){
	beforeList[k] = [null, null];
}


module.exports = function(app){
	app.io = require('socket.io')();
	// userlist에 등록시 여기에도 등록
	// username : {'한국':[a,b,c,d,e,f], 'room' : {'username':'username', 'username2':'username2'}, 

	app.io.sockets.on('connection', function(socket){
		socket.on('addUser', function(username, room, cityID){
			sortedList = listDB.insert(room, username, cityID);
			socket.logIndex = -1;
			socket.username = username;
			socket.room = room;
			socket.cityID = cityID;
			socket.join(room);
			
			socket.emit('firstLoad', logDB.getItem(room));

			socket.broadcast.to(room).emit('chatEmit', 'SERVER', username + ' has connected to ' + room);
			socket.emit('updateCityList', sortedList);	
			if(isChangedList()){
				socket.broadcast.emit('updateCityList', sortedList);	
			}
		});
		socket.on('requestPopu',function(nulls){
			app.io.sockets.in(socket.room).emit('updatePopu', listDB.getPop(socket.room));
		});
		socket.on('disconnect', function(){
			sortedList = listDB.delete(socket.room, socket.username);
			socket.broadcast.to(socket.room).emit('chatEmit', 'SERVER', socket.username + ' has disconnected');
			if(isChangedList()){
				app.io.sockets.emit('updateCityList', sortedList);	
			}
			// app.io.sockets.in(socket.room).emit('updatePopu', listDB.getPop(socket.room));
		});
		socket.on('sendchat', function (data) {
			logDB.insert(socket.room, socket.username, data);
		// we tell the client to execute 'chatEmit' with 2 parameters
			app.io.sockets.in(socket.room).emit('chatEmit', socket.username, data);
		// log 정보 저장.
		// 	log.insert(socket.room, socket.username, data);
		});
		/*
		 스크롤이 맨 위로 올라갔을 때
		 이전 로그 불러오기
		 */
		
		socket.on('loadLog', function(tmp){
			if(socket.logIndex != 0){
				mongoLog.check(socket.room, socket)
					.then(function (result) {
						var L = result;
						var devide = L.split('(**&**)');
						socket.emit('loadLogShow', socket.logIndex, devide);
					});
			}else{
				socket.emit('loadLogShow', -1, null);	// alert('불러올 로그가 없습니다!');
			}
		});
	});
	// 리스너 만들어서 sortedList 가 변경이 되었을 때 app.io.sockets.emit('updateCityList', sortedList);
}
function isChangedList(){
	var isChanged = false;
	var i;
	for(i=0; i<=9; i++){
		if(sortedList[i][0]){

			if(!(sortedList[i][0]===beforeList[i][0])){
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
			if(sortedList[j][0]){
				beforeList[j] = sortedList[j];
			}else{
				beforeList[j] = [null, null];
			}
		}
	}
	return isChanged;
}