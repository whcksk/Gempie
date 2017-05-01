/**
 * Created by whcks on 2016-11-30.
 */
var mongoose = require('mongoose');
var Index = require('../models/logIndex');
var ChatLog = require('../models/chatlog');
var Promise = require('promise');

var chatDB = (function () {
    // temp 채팅 로그를 DB에 insert 해주는 함수
    var insert = function (cityName, data, next) {
        // 도시이름에 따른 파일인덱스 스키마를 먼저 탐색
        Index.findOne({ cityName: cityName }, function (err, index) {
            console.log('Mongo insert!');
            if (err) { return err;}
            if (!index) {
                // 인덱스가 없다. 도시에 저장이 처음이다. 인덱스 새로 생성
                var index = new Index({cityName: cityName, fileIndex: 1});
            } else{
                // 있다면 하나 올려줌
                index.fileIndex++;
            }
            // DB에 저장.
            var chatLog = new ChatLog({cityName: cityName+index.fileIndex, data: data});
            index.save();
            chatLog.save();
            next();
        });
    };
    // 이전 채팅로그 탐색해서 돌려주는 함수
    var check = function (cityName, connection) {
        // 인덱스로부터 탐색
        return new Promise(function (resolve) {
            Index.findOne({cityName: cityName}).exec(function (err, index) {
                if(!index) {    //몽고에 저장된 파일이 없는경우
                    connection.logIndex = 0; // 더이상 불러오기를위해 check할 필요가 없다.
                    console.log('다뺐다. log :' + connection.logIndex);
                    return resolve(' ');
                }
                if(connection.logIndex < 0) connection.logIndex = index.fileIndex;    // 처음에 들어온 사람만의 index를 맞춰준다.
                ChatLog.findOne({cityName: cityName+connection.logIndex}).exec(function (err, log){
                    if(log){
                        console.log('index : ' + connection.logIndex);
                        connection.logIndex--;
                        resolve(log.data);
                    }else{
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