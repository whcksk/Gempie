var roomList = ['AAA', 'BBB', 'CCC' ]; // 'AAA', 'BBB', 'CCC' 
var savedList = {
	AAA : {
		size : 3,
		lists : ['a', 'ab', 'cc'],
		cityID : 'dfdfdfd'
	},
	BBB : {
		size : 4,
		lists : ['a', 'ab', 'cc','qwer'],
		cityID : 'dfdfdfd'
	},
	CCC : {
		size : 2,
		lists : ['a', 'ab'],
		cityID : 'dfdfdfd'
	}
};
var sorted = [];
var listDataBase = {};
/*
{
	AAA : {
		size : 3,
		lists : ['a', 'ab', 'cc']
	},
	BBB : {
		size : 4,
		lists : ['a', 'ab', 'cc','qwer']
	},
	CCC : {
		size : 2,
		lists : ['a', 'ab']
	}
}
			--sample--
{
	City : {
		size : number,
		lists : ['uid', 'uid', 'uid', ...],
	}
}

// activated room list
// var ex_obj = { 'a' : '1st', 'b' : '2nd', 'c' : '3rd', 'd' : '4th' };
// var obj_length = Object.keys(ex_obj).length;
*/
listDataBase.insert = function(city, uid, cityID){
	console.log(cityID);
	for(var each in savedList){
		if(each === city){
			// if(savedList[city].lists.indexOf(uid) == -1){
				savedList[each].lists.push(uid);
				savedList[each].size = savedList[each].size + 1;
			// }
			sorted = this.sort();
			return sorted;
		}
	}
	// 없다면 
	roomList.push(city);
	savedList[city] = {
		size : 1,
		lists : [uid],
		cityID : cityID
	};
	sorted = this.sort();
	return sorted;

	// savedList

	// return lists;
};
listDataBase.delete = function(city, uid){
	if(roomList.indexOf(city) != -1){
		if(savedList[city].lists.indexOf(uid) != -1){
			if(savedList[city].size <= 1){
				roomList.splice(roomList.indexOf(city), 1);
				delete savedList[city];
				return sorted;
			}else{
				savedList[city].lists.splice(savedList[city].lists.indexOf(uid), 1);
				savedList[city].size = savedList[city].size - 1;
				sorted = this.sort();
				return sorted;
			}
		}
	}
};

listDataBase.getPop = function(city){
	if(savedList[city])
		return savedList[city].lists;
	else
		return null;
}

	// if uid 존재 시 제거

	// var animals = new Array("dog","cat","seal","walrus","lion","cat");
		//배열에서 원소 제거
	// animals.splice(animals.indexOf("walrus"),1);    //dog,cat,seal,lion,cat
		//새로운 원소 삽입
	// animals.splice(animals.lastIndexOf("cat"),1,"monkey");  //dog,cat,seal,lion,monkey
	// };

//City size Sorting 후 도시list 출력 
listDataBase.sort = function(){
	var sortable = [];

	for(var each in savedList)
		sortable.push([each, savedList[each].size, savedList[each].cityID]);
	
	sortable.sort(function(a, b){
		return b[1] - a[1];
	});
	for(var i=0;i<=9;i++){
		if(!sortable[i]){
			sortable[i] = [null, null];
		}
	}
	return sortable;
};
module.exports = listDataBase;