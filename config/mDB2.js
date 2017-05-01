var chatLogDB = {};
var chatLog = {
// 	AAA : [['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']
// 		,['Jung', 'chatting']]
} 
var mongoLog = require("./mongoLog_b");
var wait = 0;
// AAA item 개수 가 100개 이상이 될 때 mongoose에 저장하기

// Load 기능은 

// 사용자가 가지고 있어야 할 정보 : 첫 로드시 memory에서 데이터를 가져오고, 그 다음부터 mongoose의 데이터를 가져온다
// 이를 위해서 현재 몇번 데이터를 가져왔는지, 첫 로드시 memory 데이터가 있는지 없는지를 확인해야 한다.
chatLogDB.insert = function(city, uid, data){
	if(chatLog[city]){
		if(chatLog[city].length >= 5){
			 if(!wait++){
			 		console.log('insert 들어온다.');
				 	var sendData = '';
					for(var item in chatLog[city]){
						sendData = sendData + chatLog[city][item][0] + '/:::/' + chatLog[city][item][1] + '(**&**)';
					}
					//sendData 전달
        	mongoLog.insert(city, sendData, function () {
					chatLog[city] = [[uid, data]];
					--wait;
					console.log('몽고에 저장 끝났다.');
        });
      }
		}
		chatLog[city].push([uid, data]);
		console.log('log : ' + chatLog[city]);
	}else{
		chatLog[city] = [[uid, data]];
	}
}
chatLogDB.getItem = function(city){
  if(chatLog[city]){
    return chatLog[city];
  }else{
    return [[]];
  }
}
/*
	mongoLog.
*/
module.exports = chatLogDB;