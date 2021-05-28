const express=require('express');
const bodyParser= require('body-parser');

const bcrypt =require('bcrypt-nodejs');
const cors=require('cors');

const app=express();

//db
const knex=require('knex');


const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',//= localhost
    user : 'postgres',
    password : 'houssam',
    database : 'wayz'
  }
});
//00
app.use(bodyParser.json());

app.use(cors());


const database ={
  users:[
  {
     id:'123',
     name:'jhon',
     lastName:'rca',
     number:'0614363807',
     email:'john@gmail.com',
     password:'cookies',
     ville:'casablanca',
     sexe:'homme',
     joined:new Date()
 },
    {
     id:'124',
     name:'Sally',
     lastName:'rca',
     number:'0614363807',
     email:'Sally@gmail.com',
     password:'bannas',
     ville:'casablanca',
     sexe:'femme',
     joined:new Date()
 }
  ]
}





app.get('/',(req,res)=>{
	db.select('*').from('users')
	.then(users=>{
		res.send(users);
	})

  
})

app.post('/signin',(req,res)=>{
  
  db.select('email','hash').from('login')
  .where('email','=',req.body.email)
    .then(data=>{
    const isValid=	bcrypt.compareSync(req.body.password, data[0].hash);
    	if(isValid){ 
    	return	db.select('*').from('users')
    		  .where('email','=',req.body.email)
    		  .then(user=>{
    		  	console.log(isValid)
    		  	res.json(user[0])
    		  })
    		  .catch(err=>res.status(400).json('unable to get user'))
    	} else{
    		res.status(400).json('wrong credentials')
    	}

    })
    .catch(err=>res.status(400).json("wrong credentials"))
  
  // if(req.body.email===database.users[0].email && req.body.password===database.users[0].password){

  // res.json(database.users[0]);}
  // else{res.status(400).json('Faild');}
})

app.post('/register',(req,res)=>{
  const {email,name,password,lastName,number,ville,sexe}=req.body;
  
  const hash = bcrypt.hashSync(password);


  db.transaction(trx=>{
  	 trx.insert({
  	 	hash:hash,
  	 	email:email
  	 })
  	 .into('login')
  	 .returning('email')
  	 .then(loginEmail=>{
  	 	  trx('users')
        .returning('*')
        .insert({
              email:loginEmail[0],
              name:name,
              lastname:lastName,
              number:number,
              ville:ville,
              sexe:sexe,
              joined:new Date()
            })
         .then(user=>{
            res.json(user[0]);  
          }) 
           })
  .then(trx.commit)
  .catch(trx.rollback)
  	
  })
  .catch(err=>res.status(400).json('unable to register'))

  // database.users.push({
  //    id:'125',
  //    name:name,
  //    email:email,
  //    password:password,
  //    lastName:lastName,
  //    number:number,
  //    ville:ville,
  //    sexe:sexe,
  //    joined:new Date()
  // })  

  // res.json(database.users[database.users.length-1]);  
  // dakchi l9dime 9bla mansaybe database
})


app.post('/creeCovSimple',(req,res)=>{
    const {prix,nbr_place_dispo,date,heureDepart,heureArrivee,userId,bagage,type_vehicule,confort_voiture,depart,arrive}=req.body;
db.insert({
	depart: depart,
    arrive:arrive,
    heuredepart:heureDepart,
    heurearrivee:heureArrivee,
     date:date,
      nbr_place_dispo:nbr_place_dispo,
       bagage:bagage,
       type_vehicule:type_vehicule,
   	  confort_voiture:confort_voiture,  
      prix:prix,	
      userid:userId	
     })
.into('covsimple')
.returning('*')
.then(user=>res.json(user[0]))
.catch(err=>res.status(400).json('unable to create a simple cov'))




})

app.get('/covSimple',(req,res)=>{
	db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,
		           depart,arrive,heuredepart,heurearrivee,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,userid
	         from covsimple c,users u
			 where u.id=c.userid`)
	.then(users=>{
		res.send(users.rows);
	})
	.catch(err=>res.status(404).json('unable to response a simple cov'))
})

app.post('/mesCov',(req,res)=>{
	const {id}=req.body;
	db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,
		           depart,arrive,heuredepart,heurearrivee,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,userid
	         from covsimple c,users u
			 where u.id=c.userid
			 and c.userid=${id}`)
	.then(users=>{
		res.send(users.rows);
	})
	.catch(err=>res.status(404).json('unable to response a simple cov'))
})

app.get('/profile/:id',(req,res)=>{
  const {id}=req.params;
  let found=false;
  database.users.forEach(user=>{
    if(user.id===id){
      found=true;
     return res.json(user)
    }

  })
  if(!found){
    return res.status(400).json('not found');
  }
})

app.listen(3001,()=>{

  console.log('app is runing on port 3001');
})

/*

  /-->res=this is working
  /signin -->POst   =succes/fail
  /register -->POST  = return  new user
  /profile/:userId --> GET = user
  /image --> PUT(update in the user profile) --> user update
  

*/

/*

create table covsimple(
id serial primary key,
depart varchar(100) not null,
arrive varchar(100) not null,
heureDepart varchar(100) not null,
heureArrivee varchar(100) not null,
 date date not null,
 nbr_place_dispo bigint not null,
bagage varchar(100) ,
type_vehicule varchar(100) not null,
confort_voiture varchar(100) not null,
 prix int not null,
	userId 	int not null
)


*/