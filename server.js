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


// const database ={
//   users:[
//   {
//      id:'123',
//      name:'jhon',
//      lastName:'rca',
//      number:'0614363807',
//      email:'john@gmail.com',
//      password:'cookies',
//      ville:'casablanca',
//      sexe:'homme',
//      joined:new Date()
//  },
//     {
//      id:'124',
//      name:'Sally',
//      lastName:'rca',
//      number:'0614363807',
//      email:'Sally@gmail.com',
//      password:'bannas',
//      ville:'casablanca',
//      sexe:'femme',
//      joined:new Date()
//  }
//   ]
// }





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

app.post('/creeCovAvance',(req,res)=>{
    const {prix,nbr_place_dispo,date,userId,bagage,type_vehicule,confort_voiture,state,lat,lng}=req.body;
db.insert({
    state:state,
    lat:lat,
    lng:lng,
     date:date,
      nbr_place_dispo:nbr_place_dispo,
       bagage:bagage,
       type_vehicule:type_vehicule,
      confort_voiture:confort_voiture,  
      prix:prix,  
      userid:userId 
     })
.into('covavance')
.returning('*')
.then(user=>res.json(user[0]))
.catch(err=>res.status(400).json('unable to create an avance  cov'))




})

app.post('/covSimple',(req,res)=>{
  const {id}=req.body;
	db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
		           depart,arrive,heuredepart,heurearrivee,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,userid
	         from covsimple c,users u
			 where u.id=c.userid
       and u.id!=${id}`)
	.then(users=>{
		res.send(users.rows);
	})
	.catch(err=>res.status(404).json('unable to response a simple cov'))
})

app.post('/covAvance',(req,res)=>{
  const {id}=req.body;
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
               lat,lng,state,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,userid
           from covavance c,users u
       where u.id=c.userid
       and u.id!=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a simple cov'))
})



app.post('/mesCov',(req,res)=>{
	const {id}=req.body;
	db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
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

app.post('/mesCovAvance',(req,res)=>{
  const {id}=req.body;
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
               lat,lng,state,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,userid
           from covavance c,users u
       where u.id=c.userid
       and u.id=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a simple cov'))
})


app.post('/saveCovSimple',(req,res)=>{
    const {userId,covSId}=req.body;
    
  db.raw(`select *
        from savecovs
       where userid=${userId}
       and   covsid=${covSId}`)
  .then(users=>{
    
    if(!users.rows[0]){
        db.insert({
    userid:userId ,
    covsid:covSId,
    joined:new Date()
     })
.into('savecovs')
.returning('*')
.then(user=>res.json(user[0]))
.catch(err=>res.status(400).json('unable to create a simple cov'))

    }
    else{
      res.status(400).json('covoiturage deja exicttant');
    }
  })

    


})

app.post('/saveCovAvance',(req,res)=>{
    const {userId,covAId}=req.body;
    
  db.raw(`select *
        from savecova
       where userid=${userId}
       and   covaid=${covAId}`)
  .then(users=>{
    
    if(!users.rows[0]){
        db.insert({
    userid:userId ,
    covaid:covAId,
    joined:new Date()
     })
.into('savecova')
.returning('*')
.then(user=>res.json(user[0]))
.catch(err=>res.status(400).json('unable to create an avnce cov'))

    }
    else{
      res.status(400).json('covoiturage deja exicttant');
    }
  })

    


})


app.post('/afficherSaveCovSimple',(req,res)=>{
    const {userId}=req.body;
    
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
               depart,arrive,heuredepart,heurearrivee,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,c.userid
           from covsimple c,users u,savecovs s
       where u.id=c.userid
           and s.userid=${userId}
         and s.covsid=c.id`)
  .then(users=>{
    
    res.send(users.rows);
    
  })
  .catch(err=>res.status(400).json('unable to see covoiturage simple'))


})

app.post('/afficherSaveCovAvance',(req,res)=>{
    const {userId}=req.body;
    
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
               lat,lng,state,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,c.userid
           from covavance c,users u,savecova s
       where u.id=c.userid
           and s.userid=${userId}
         and s.covaid=c.id`)
  .then(users=>{
    
    res.send(users.rows);
    
  })
  .catch(err=>res.status(400).json('unable to see covoiturage avance'))


})

app.post('/creeTrajet',(req,res)=>{
    const {nbr_place_dispo,date,heureDepart,heureArrivee,userId,bagage,depart,arrive}=req.body;
db.insert({
    depart: depart,
    arrive: arrive,
    heuredepart:heureDepart,
    heurearrivee:heureArrivee,
     date:date,
      nbr_place_dispo:nbr_place_dispo,
       bagage:bagage, 
      userid:userId
     })
.into('trajet')
.returning('*')
.then(user=>res.json(user[0]))
.catch(err=>res.status(400).json('unable to create a trajet'))




})

app.post('/trajet',(req,res)=>{
  const {id}=req.body;
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
               depart,arrive,heuredepart,heurearrivee,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,userid
           from trajet c,users u
       where u.id=c.userid
       and u.id!=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a trajet'))
})

app.post('/mesTrajet',(req,res)=>{
  const {id}=req.body;
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.rating,
               depart,arrive,heuredepart,heurearrivee,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,userid
           from trajet c,users u
       where u.id=c.userid
       and u.id=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a mine trajet'))
})


app.get('/users',(req,res)=>{
  
  db.raw(`select * from users
          where name!='admin' and lastname!='admin'
    `)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a mine trajet'))
})

app.get('/map',(req,res)=>{
  
  db.raw(`select c.id id,u.name as name,u.lastname as lastname ,u.number number,u.email,u.sexe,u.rating,
               lat,lng,state,to_char(date,'DD/MM/YYYY') date,nbr_place_dispo,
                   bagage,type_vehicule,confort_voiture,prix,userid
           from covavance c,users u
       where u.id=c.userid`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a map information'))
})

app.post('/rating',(req,res)=>{
  const {id,value}=req.body;
  db.raw(`update users
set rating=(rating+${value})/2
where id=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to response a simple cov'))
})

app.post('/deleteCovSimple',(req,res)=>{
  const {idcov}=req.body;
  db.raw(`delete from covsimple
          where id=${idcov}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteCovAvance',(req,res)=>{
  const {idcov}=req.body;
  db.raw(`delete from covavance
          where id=${idcov}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteTrajet',(req,res)=>{
  const {idcov}=req.body;
  db.raw(`delete from trajet
          where id=${idcov}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})



app.post('/deleteSaveCovSimple',(req,res)=>{
  const {idcov}=req.body;
  db.raw(`delete from savecovs
          where id=${idcov}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})







app.post('/deleteCovSimpleA',(req,res)=>{
  const {id}=req.body;
  db.raw(`delete from covsimple
          where userid=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteCovAvanceA',(req,res)=>{
  const {id}=req.body;
  db.raw(`delete from covavance
          where userid=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteSaveCovSimpleA',(req,res)=>{
  const {id}=req.body;
  db.raw(`delete from savecovs
          where userid=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteSaveCovAvancaA',(req,res)=>{
  const {id}=req.body;
  db.raw(`delete from savecova
          where userid=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteTrajetA',(req,res)=>{
  const {id}=req.body;
  db.raw(`delete from trajet
          where userid=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteUserA',(req,res)=>{
  const {id}=req.body;
  db.raw(`delete from users
          where id=${id}`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
})

app.post('/deleteProfilA',(req,res)=>{
  const {email}=req.body;
  db.raw(`delete from login
          where email='${email}'`)
  .then(users=>{
    res.send(users.rows);
  })
  .catch(err=>res.status(404).json('unable to delete a simple cov'))
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

/*
create table covavance(
id serial primary key,
lat double precision not null,
lng double precision not null,  
state varchar(100) not null,

 date date not null,
 nbr_place_dispo bigint not null,
bagage varchar(100) ,
type_vehicule varchar(100) not null,
confort_voiture varchar(100) not null,
 prix int not null,
  userId  int not null
)

*/

/*
create table savecovs(
  userId  int not null,
  covsid int not null,
  joined timestamp not null 
  
)*/

/*
create table savecova(
  userId  int not null,
  covaid int not null,
  joined timestamp not null
)


*/

/*
create table trajet(
id serial primary key,
depart varchar(100) not null,
arrive varchar(100) not null,
heureDepart varchar(100) not null,
heureArrivee varchar(100) not null,
 date date not null,
 nbr_place_dispo bigint not null,
bagage varchar(100) ,
userId  int not null
)

*/