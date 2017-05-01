/**
 * Created by whcks on 2016-11-30.
 */
require('../app');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var Index = require('../models/logIndex');
var Promise = require('promise');
var conn = mongoose.connection;
var gfs = Grid(conn.db, mongoose.mongo);

var chatDB = (function () {
    // temp 채팅 로그를 DB에 insert 해주는 함수
    var insert = function (cityName, next) {
        // 도시이름에 따른 파일인덱스 스키마를 먼저 탐색
        Index.findOne({ cityName: cityName }, function (err, index) {
            if (err) { return err;}
            if (!index) {
                // 인덱스가 없다. 도시에 저장이 처음이다. 인덱스 새로 생성
                var index = new Index({cityName: cityName, fileIndex: 1});
            } else{
                // 있다면 하나 올려줌
                index.fileIndex++;
            }
            // DB에 저장.
            var writestream = gfs.createWriteStream({filename: cityName + index.fileIndex, mode: 'w'});
            fs.createReadStream('/home/ubuntu/workspace/chatlog/'+cityName+'.txt').pipe(writestream);
            index.save();
            next();
        });
    };
    // 이전 채팅로그 탐색해서 돌려주는 함수
    var check = function (cityName, connection) {
        // 인덱스로부터 탐색

        return new Promise(function (resolve) {
            Index.findOne({cityName: cityName}).exec(function (err, index) {
                if(!index) {    //몽고에 저장된 파일이 없는경우
                    connection.logIndex = -1; // 더이상 불러오기를위해 check할 필요가 없다.
                    return resolve(' ');
                }
                if(connection.logIndex < 1) connection.logIndex = index.fileIndex;    // 들어온 사람만의 파일 인덱스를 맞춰준다. 0은 처음. -2는..
                gfs.exist({filename: cityName + connection.logIndex})   // 파일이 있다면
                    .then(function(found){
                        if(found){
                    
                            var path = '/home/ubuntu/workspace/chatlog/'+ cityName + connection.logIndex + '.txt';
                            var file =  gfs.createReadStream({filename: cityName + connection.logIndex, mode: 'r'});    //읽어서
                            var out = fs.createWriteStream(path);    //쓴다.

                            file.on('data', function(data) {    //읽어들이는 족족
                                out.write(data);    // 쓴다.
                            });
                            file.on('end', function() { // 읽는 게 끝이 나면
                                out.end(function() {
                                    resolve(path);
                                });
                            });
                        } else{
                            reject('DB ERROR');
                        }
                    });
            });
        });
    }
    return {
        insert: insert,
        check: check
    }
}());

module.exports = chatDB;