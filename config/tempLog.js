var fs = require('fs');
var gfs = require('./mongoLog');
var Promise = require('promise');

var tempLog = (function(){
    var insert = function(cityName, userName, receive_data) {
        // chatlog 폴더에 도시이름의 txt파일에 (없으면 생성) 내용을 한 줄씩(\n) 기입
        var path = '/home/ubuntu/workspace/chatlog/'+ cityName +'.txt';
        var wait = 0;
        
        fs.appendFileSync(path, '\n' + userName+ '/:::/' + receive_data, 'utf8');
        
        var fileSizeInBytes = fs.statSync(path)["size"];
        if(fileSizeInBytes > 10000000.0){            //1000000.0 1M
            if(!wait++){
                // 15MB 이상의 채팅로고 작성시 몽고DB에 저장 **
                gfs.insert(cityName, function () {
                    fs.unlink(path, function (err) {    // 위의 file append속의 open과 맞물리면 서버 터짐
                        if (err) throw err;
                    });
                    --wait;
                });
            }
        }
    };
    var showBefore = function (cityName, connection) {
        return new Promise(function (resolve) {
            var path = '/home/ubuntu/workspace/chatlog/'+ cityName +'.txt';
            // 처음엔 temp 파일의 유무 확인 **
            if(connection.logIndex == 0){
                if(fs.existsSync(path)){    // 서버에 temp파일 존재 시.
                    connection.logIndex = -2;  // 다음번 load를위한 이상한 index값
                    resolve(path);
                } else {
                    resolve(gfs.check(cityName, connection));
                }
            } else if(connection.logIndex == -1){
                reject(' '); // -1은 더이상 볼 일 없는 경우.
            }else{
                resolve(gfs.check(cityName, connection));
            }
        });
    }
    return {
        insert: insert,
        showBefore: showBefore
    }
}());

module.exports = tempLog;