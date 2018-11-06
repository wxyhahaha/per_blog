var url = "mongodb://localhost:27017/wxydb;"
const MongoClient = require('mongodb').MongoClient;

// module.exports.find=function(dbname,collection,obj,res){
// 		MongoClient.connect(url,(err,db)=>{
// 		if(err) throw err;
// 		console.log('数据库已创建好');
// 		db.db(dbname).collection(collection).find(obj).toArray((err,res1)=>{			
// 			console.log(res1);
// 			res.send(res1)
// 		})
// 	})
// }

//上面的代码的封装也没必要，再进行优化
//回调函数，（高阶函数），执行代码在执行回调函数里的代码，此处，先执行连接服务器的代码分别再执行增删改
//也就是先声明一个函数,是执行连接服务器的代码
function _connect(callback){
	MongoClient.connect(url,(err,db)=>{
		if(err) return;
		callback(db);//再执行增或删或改的代码
	})
}
module.exports={
	// find:function(dbname,collection,obj,res){//引用connectdb模块，{find:function(){}}
	// 		_connect(function(db){//function是回调函数，执行操作
	// 			db.db(dbname).collection(collection).find(obj).toArray((err,res1)=>{			
	// 				console.log(res1);
	// 				res.send(res1)
	// 			})
	// 		})
	// 	},
	insert:function(dbname,collection,obj,res,callback){//引用connectdb模块，{find:function(){}}
			_connect(function(db){//function是回调函数，执行操作
				if(obj instanceof Array){
					 obj=obj

				}
				else{
					
					 obj=[obj]
				}
				db.db(dbname).collection(collection).insertMany(obj,(err,res1)=>{
					if(err) throw err;
					callback(res1);
					// console.log('插入成功');
					// res.send(res1);
				})
			})
		},
	update:function(dbname,collection,whereStr,obj,bool,res,callback){//引用connectdb模块，{find:function(){}}
			_connect(function(db){//function是回调函数，执行操作
				if(bool){
						db.db(dbname).collection(collection).updateOne(whereStr,obj,(err,res1)=>{			
						console.log('一个更新成功');
						
						callback(res1)
					})
				}else{
						db.db(dbname).collection(collection).updateMany(whereStr,obj,(err,res1)=>{			
						console.log('全部更新成功');
						
						callback(res1)
					})
				}

			})
		},
	del:function(dbname,collection,obj,bool,res,callback){//引用connectdb模块，{find:function(){}}
			_connect(function(db){//function是回调函数，执行操作
				if(bool){
						db.db(dbname).collection(collection).deleteOne(obj,(err,res1)=>{			
						if (err) throw err;
						callback(res1)
						// res.send(obj);
					})	
				}
				else{
					db.db(dbname).collection(collection).deleteMany(obj,(err,res1)=>{			
						console.log('全部删除成功');
						
						// res.send(res1)
					})	
				}

			})
		},
	find:function(dbname,collection,obj,res,callback1,mysort1,m1,n1){//limit n0为显示所有 
			var par= arguments.length;
			_connect(function(db){
				var mysort={};
				var m=0;
				var n=0;
				if(par == 5){
					callback = callback1;
				}
				else if(par == 6){
					callback = callback1;
					mysort = mysort1;
				}
				else if(par == 7){
					callback = callback1;
					mysort = mysort1;
					m=m1;
				}
				else if(par == 8){
					callback = callback1;
					mysort = mysort1;
					m=m1;
					n=n1;
				}		
				db.db(dbname).collection(collection).find(obj).sort(mysort).skip(m).limit(n).toArray((err,res1)=>{
				// console.log(res1);//re1 返回的是一个数组
				callback(res1);
				// res.send(res1)
			})
			
		})
	}
}