const express = require('express');
//const morgan = require('morgan');
const bodyParser = require('body-parser');
var session = require('express-session');
//const mysql = require('mysql2');
const mongoose = require ('mongoose');
var cors = require('cors');
const Models = require('./models.js');
const Movies = mongoose.model('movies');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const auth =require('./auth');

const app = express();
const GC_MONGO_URL = "mongodb://localhost:27017/movies";
const ObjectID = require('mongodb').ObjectID;
mongoose.connect(GC_MONGO_URL, { useUnifiedTopology: true, useNewUrlParser: true });

app.use(session({secret:'XASDASDA'}));
var ssn;
app.use(bodyParser.urlencoded({ extended: false}));

app.use(cors());
//app.use(morgan('common'));
app.use(express.static("public"))
app.use(function (err, req, res, next){
    console.log(err)
    next(err)
});
app.get("/movies", async (req, res) =>{

	mongoose.model('movies').find((err,movies)=>{
		res.send(movies);
	});
	
});
app.get("/movie/title/:title", async (req, res) =>{
	const title = req.params.title;

	mongoose.model('movies').findOne ({description: title},(err,movie)=>{
		res.send(movie);
	});
});

app.get("/movies/genre/:movies", async (req, res) =>{
	const genre = req.params.genre;
	console.log("id: "+genre)
	
	mongoose.model('movies').findOne ({genre:{category:movies}},(err,movie)=>{
		res.send(movie.genre);
	});
});
app.get("/movies/director/:name", async (req, res) =>{
	const nm = req.params.name;
	console.log("name: "+nm)

	mongoose.model('movies').findOne ({"director.name": {$eq: nm}},(err,movies)=>{
		if (err)
		{
			console.log(err);
		}
		res.send(movies.director);
	});
});
app.get('/users/register', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/users/register">\
    <br/>Enter Username:<br><input type="text" name="email">\
	<br/>Enter Full Name:<br><input type="text" name="fullname">\
	<br/>Enter birthdate:<br><input type="text" name="birthdate">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

app.get('/login', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/users/login">\
    Enter Username:<br><input type="text" name="email">\
    <br>Enter ID:<br><input type="text" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});
var GV_USER=null;
app.post(
	'/users/register',
	passport.authenticate('signup', { session: false }),
	async (req, res, next) => {
		//await saveUser()
		let u=req.user;
		u.fullname= req.body.fullname;
		u.birthday=req.body.birthdate;
		console.log(u);
		await saveUser(u);
	  res.json({
		message: 'Signup successful',
		user: u
	  });
	}
  );
  async function saveUser (updateUser)
  {
	  console.log ("SAVE USER:");
	  console.log (updateUser);
	const result = await mongoose.model('users').findOne({_id: ObjectID(updateUser._id)},(err,user)=>{
		user.fullname=updateUser.fullname;
		user.email=updateUser.email;
		user.password=updateUser.password;
		user.birthday=updateUser.birthday;
console.log (user);
		user.save((err)=>{
			if (err)
			{
				console.log (err);
				//res.end("user not updated");
			}else{
				//res.end("user updated");
			}
	});
	})
	return;
  } 
  app.post(
	'/users/login',
	async (req, res, next) => {
	   // const user = {password: req.body.password, email: req.body.email};
	   // console.log(user);
	  passport.authenticate(
		'login',
		async (err, user, info) => {
		  try {
			  console.log ("auth done");
			  //console.log(user);
			if (err || !user) {
			//  const error = new Error('An error occurred.');
				return res.json({Error: "An error occurred."});
			 // return next(error);
			}
  
			req.login(
			  user,
			  { session: false },
			  async (error) => {
				if (error) return next(error);
  
				const body = { _id: user._id, email: user.email };
				const token = jwt.sign({ user: body }, 'TOP_SECRET');
  
				return res.json({ token });
			  }
			);
		  } catch (error) {
			return next(error);
		  }
		}
	  )(req, res, next);
	}
  );
app.post("/users/registerOld", async (req, res) =>{
	// /users/register?username=june17&email=june17@test.com&fullname=June17 Test&birthday=1990-01-02&password=Test1234;
	console.log (req.body);
	const user = {
		username: req.body.username,
		email: req.body.email,
		fullname:req.body.fullname,
		birthday:req.body.birthday,
		password: req.body.password,
		favorites:[]
	};
	console.log(user);
	mongoose.model('users').create(user);
	res.send(user);
});
app.post("/users/update", async (req, res) =>{
	const id = req.body.id;
	const userUpdate = {
		
		username: req.body.username,
		email: req.body.email,
		fullname:req.body.fullname,
		birthday:req.body.birthday,
		password: req.body.password,
		favorites:[]
	};
	console.log (userUpdate);
	const result = await mongoose.model('users').findOne({_id: ObjectID(id)},(err,user)=>{
		user.username=userUpdate.username;
		user.email=userUpdate.email;
		user.password=userUpdate.password;
		user.birthday=userUpdate.birthday;
//console.log (movie);
		user.save((err)=>{
			if (err)
			{
				console.log (err);
				res.end("user not updated");
			}else{
				res.end("user updated");
			}
	});
	})
});
app.get("/user/movie/add/:un/:id", async (req, res) =>{
	const un = req.params.un;
	const id= req.params.id;
	
	mongoose.model('users').findOne ({username:un},(err,user)=>{
			user.favorites.push (parseInt(id));
//console.log (movie);
			user.save((err)=>{
				if (err)
				{
					console.log (err);
					res.end("Favorite not added");
				}else{
					res.end("Favorite Added");
				}
		});
	});
})
app.get("/user/movie/remove/:un/:id", async (req, res) =>{
	const un = req.params.un;
	const id= parseInt(req.params.id);
	
	mongoose.model('users').findOne ({username:un},(err,user)=>{
			let fav=[];
			user.favorites.forEach ((val)=>{
				if (val!==id)
				{
					fav.push (val);
				}
			})

			user.favorites=fav;
//console.log (movie);
			user.save((err)=>{
				if (err)
				{
					console.log (err);
					res.end("Favorite not removed");
				}else{
					res.end("Favorite removed");
				}
		});
	});
})
app.get("/user/unreg/:un", async (req, res) =>{
	const un = req.params.un;
	mongoose.model('users').deleteOne ({username:un},(err,user)=>{
		//user.remove();
		res.send ("unregistered");
	})
})
app.get("/user/delete/:un", (req, res)=> {
	const un = req.params.un+"";
	//console.log("ID: "+id);
	mongoose.model('users').deleteOne({username:un},(err,u)=>{
		res.end("user deleted");
	});
});
app.get("/users", (req, res)=>{
	const connection = mongoose.connection;
	mongoose.model('users').find ((err,users)=>{
		res.send(users);
	});
});
app.get("/movie/update/:id/:name",  (req, res) =>{
	const id = req.params.id;
	const name = req.params.name;
	
	mongoose.model('movies').findOne ({id: parseInt(id)},(err,movie)=>{
			movie.description=name;

			movie.save((err)=>{
				if (err)
				{
					console.log (err);
					res.end("Movie NOT Updated");
				}else{
					res.end("Movie Updated");
				}
		});
	});
});
app.get("/movie/updateBio/:id/:bio",  (req, res) =>{
	const id = req.params.id;
	const bio = req.params.bio;
	
	//User.update({"created": false}, {"$set":{"created": true}}, {"multi": true}, (err, writeResult) => {});
	var myquery = { "director.id": parseInt(id)};
	var newvalues = { $set: {"director.bio": bio} };
	Movies.updateMany(myquery, newvalues, {"multi": true}, (err, writeResult) => {});
	
	res.end("updated");
});
app.get("/user/:un", async (req, res) =>{
	const un = req.params.un;
	mongoose.model('users').findOne ({username:un},(err,user)=>{
		res.send(user);
	})
});






app.get("/movies/title/:title", async (req, res) =>{
	const title = req.params.title;
	console.log("id: "+genre)
	
	mongoose.model('movies').find ({genre:{category:genre}},(err,movies)=>{
		res.send(movies);
	});
});

app.get("/movies/gd/:genre/:dir", async (req, res) =>{
	const genre = req.params.genre;
	const dir = req.params.dir;
	console.log (dir+", genre: "+genre);
	
	mongoose.model('movies').find ({genre:{category:genre},"director.name": {$eq: dir}},(err,movies)=>{
		if (err)
		{
			console.log(err);
		}
		res.send(movies);
	});
});


app.get("/login",  (req, res) =>{
    ssn=req.session;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h3>Login:</h3><form action="login" method="post">');
    res.write('<p>Username: <input type="text" name="username" placeholder="username"></p>');    
    res.write('<p>Password: &nbsp;<input type="password" name="password" placeholder="password"></p>');
    res.write('<p><input type="submit" value="Login"></p>');
    res.write('</form><a href="/new">Create profile</a>');
    res.end();
});
app.post ("/login", async (req, res) =>{
	const un = req.body.username;
	const pw = req.body.password;
	const user = await getUser(un);
	if (user.password==pw)
	{
		ssn=req.session;
        ssn.user=user;
		res.end("logged in");
	}else{
		res.end("invalid loggin");
	}
});
async function getUser (un)
{
	let foundUser = await mongoose.model('users').findOne({ username:un });
	return foundUser;
}
app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
})

function getCurrentUser ()
{
	try {
		const user=ssn.user;
		if (user==null){
			//res.end("not logged in");
			return null;
		}
		return user;
	}catch (e){
		return null;
	}
}
app.get('/users', (req, res) => {
	const user = getCurrentUser();
	if (user==null)
	{
		res.end("no logged in user");
	}else if (user.roleId != 2)
	{
		res.end("not authorized");
	}
	else {
		res.json(users);
	}
})

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})
