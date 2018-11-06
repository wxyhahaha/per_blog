const express = require('express');
const app = express();
//ejs
const ejs = require('ejs');
app.set('view engine','ejs');
//session
const session = require('express-session');
//持久化
var NedbStore = require('nedb-session-store')( session );

//post
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
//引入数据库增删改模块
const connectdb = require('./model/connectdb.js');
//用于id转化成数据库中的格式
const ObjectId = require('mongodb').ObjectId;
var unescapeHTML = function(a){  
    a = "" + a;  
    return a.replace(/</g, "<").replace(/>/g, ">").replace(/&/g, "&").replace(/"/g, '"').replace(/'/g, "'");  
}
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
  	maxAge:200000000
  },
  store: new NedbStore({
      filename: 'path_to_nedb_persistence_file.db'
    })
}))
app.use('/public',express.static('./public/'));
app.get('/',(req,res)=>{
  var discussion_show = false;
  if(req.query.okma){
    discussion_show = true;
  }
   if(req.session.login){

       connectdb.find("wxydb","articel",{},res,function(res1){
        var content1 = unescapeHTML(res1)
        
    res.render('weibo',{
                        show:true,
                        content:res1,
                        username:req.session.username,
                        discussion_show:discussion_show,
                        a:content1
                      });
    
  })
    
   }
   else{
   connectdb.find("wxydb","articel",{},res,function(res1){
    res.render('weibo',{show:false,content:res1,discussion_show:discussion_show,username:req.session.username,});
  })
    
   }
	
})
app.post('/showdiscussion',urlencodedParser,(req,res)=>{
  var discussion_show = false;
  var _id = ObjectId(req.body._id)
  if(req.body.okma){
    discussion_show = true;
  }
   if(req.session.login){

       connectdb.find("wxydb","articel",{_id:_id},res,function(res1){
        
    res.send({          
            content:res1[0].discussion,
            username:req.session.username,
            discussion_show:discussion_show
          });
    
  })
    
   }
   else{
   connectdb.find("wxydb","articel",{},res,function(res1){
    res.send({content:res1,discussion_show:discussion_show});
  })
    
   }
  
})
app.get('/publish',(req,res)=>{
 
  if(req.session.login){
    var date = new Date(); 
    var time = date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'号 '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    connectdb.insert("wxydb","articel",{writer:req.session.username,content:req.query.content,time:time,discussion:[]},res,function(res1){
      
     res.send({status:1,content:res1.ops[0]});
    })
   
  }
  else{

    res.send({status:0})
  }
})
app.get('/quit',(req,res)=>{
  req.session.username=null;
  req.session.login=false;
  res.redirect('http://localhost:8585/')
})
app.post('/login',urlencodedParser,(req,res)=>{

    connectdb.find("wxydb","user",{username:req.body.username},res,function(res1){
      

      if(res1.length == 0){
            res.send({status:1})
      }
      else{
        if(req.body.pass == res1[0].pass){
            req.session.username=req.body.username;
            req.session.login=true;
            res.send({status:0})
        }
        else{
          res.send({status:2})
        }
           
      }
    })

})
app.post('/register',urlencodedParser,(req,res)=>{

    connectdb.find("wxydb","user",{username:req.body.username},res,function(res1){

      if(res1.length == 0){
        
        if(req.body.pass){
          connectdb.insert("wxydb","user",{username:req.body.username,pass:req.body.pass},res,function(){
            res.send({status:3})
          })
        }
        else{
          res.send({status:1})
        }
        
      }
      else{
           res.send({status:0})
      }
    })

})

//评论
app.post('/discuss',urlencodedParser,(req,res)=>{
  
  var date = new Date();
  var writer = req.body.writer;
  var _id = ObjectId(req.body._id)
  var time = date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'号 '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
  discussion={
    discuss_username:req.body.username,
    content:req.body.content,
    time:time
  }
  
  if(req.body.username == null){
    res.send({status:'用户没登录'});
  }
  else{
    connectdb.find("wxydb","articel",{_id:_id},res,function(res1){
    
      var obj = res1[0];
      res1[0].discussion.push(discussion)
      //dbname,collection,whereStr,obj,bool,res,callback
      connectdb.update("wxydb","articel",{_id:_id},{$set:{discussion:res1[0].discussion}},true,res,function(res2){
        
        res.send({status:res2,info:discussion,username:req.session.username})
      })
      
    })
  }
  
})

app.get('/userhome',(req,res)=>{
  connectdb.find("wxydb","articel",{writer:req.session.username},res,function(res1){
    
    res.render('userhome',{info:res1})
  })
})
app.listen(8585,'localhost');