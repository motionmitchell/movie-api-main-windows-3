const express = require('express');
//const morgan = require('morgan');
const bodyParser = require('body-parser');
var session = require('express-session');
//const mysql = require('mysql2');

const { Client } = require('pg');
const app = express();
const client = new Client({
	user: 'postgres',
	database: 'postgres',
	password: 'scotland',
	host: 'localhost',
	port: '5432',
	log: console.log,
	ssl: false,
  });
client.connect();
app.use(session({secret:'XASDASDA'}));
var ssn ;
app.use(bodyParser.urlencoded({ extended: false}));

const movies = [
	{id: 1, description: "The Matrix", genre: "Action", director: "", imageURL: ""},
	{id: 2, description: "Fight Club", genre: "Action", director: "", imageURL: ""},
	{id: 3, description: "Avatar", genre: "Sci Fi", director: "", imageURL: ""},
	{id: 4, description: "The Godfather", genre: "Action", director: "", imageURL: ""},
	{id: 5, description: "The Dark Knight", genre: "Thriller", director: "", imageURL: ""},
	{id: 6, description: "Pulp fiction", genre: "", director: "", imageURL: ""},
	{id: 7, description: "Inception", genre: "Action", director: "", imageURL: ""},
	{id: 8, description: "Intersteller", genre: "Sci Fi", director: "", imageURL: ""},
	{id: 9, description: "Forest Gump", genre: "Comedy", director: "", imageURL: ""},
	{id: 10, description: "Gladiator", genre: "Action", director: "", imageURL: ""}
]
const directors = [
	{id:1,   name: "George Lucas", bio: "", birthYear: 1920, deathYear: null},
	{id:2,   name: "David Fincher", bio: "", birthYear: 1920, deathYear: null},
	{id:3,   name: "Christopher Nolen", bio: "", birthYear: 1920, deathYear: null},
	{id:4,   name: "David Yates", bio: "", birthYear: 1920, deathYear: null},
	{id:5,   name: "Robbin Williams", bio: "", birthYear: 1920, deathYear: 2014}
]

const genre = [
	{id:1,   category: "Pyschoglogical horror", description: "a very horrifying film", Movies: "the shining" },
	{id:2,   category: "Indapendant movie", description: "indie movie", Movies: "Fight Club", },
]

const name = [
	{id:1,   name: "samuel leroy Jackson", bio: "is an american actor", born: "Decmber 21, 1948" },
]

var users =[
	{username: 'admin', password: 'Test1234', fullname: 'Admin', email: 'admin@test.com', roleId: 2},
	{username: 'bob', password: 'Test1234', fullname: 'Bob', email: 'bob@test.com', roleId: 1}
];
//app.use(morgan('common'));
app.use(express.static("public"))
app.use(function (err, req, res, next){
    console.log(err)
    next(err)
    })
app.get('/', (req, res)=> {
    res.send("Welcome to my app")
})
app.get("/movies2",  (req, res) =>{
	res.send(movies);
	res.end();
});
app.get("/movies", async (req, res) =>{
	
	const qry = 'SELECT * FROM view_movies';
	const rows =await query (qry);
	res.send(rows);
	res.end();
	
});
async function query (qry)
{
	const res= await client.query(qry);
	return res.rows;
}
app.get("/movie/:id", async (req, res) =>{
	const id = req.params.id;
	console.log("ID: "+id);
	const qry = 'SELECT * FROM view_movies WHERE id ='+id;
    const rows =await query (qry);
	res.send(rows);
	res.end();
});
app.get("/genre/:id", async (req, res) =>{
	const id = req.params.id;
	console.log("ID: "+id);
	const qry ='SELECT name FROM genres WHERE id ='+id;
	const rows =await query (qry);
	res.send(rows);
	res.end();
});
app.get("/director/:id", async (req, res) =>{
	const id = req.params.id;
	console.log("ID: "+id);
	const qry = 'SELECT * FROM directors WHERE id ='+id;
	const rows =await query (qry);
	res.send(rows);
	res.end();
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
app.post ("/login",  (req, res) =>{
	const un = req.body.username;
	const pw = req.body.password;
	const user = getUser(un);
	if (user.password==pw)
	{
		ssn=req.session;
        ssn.user=user;
		res.end("logged in");
	}else{
		res.end("invalid loggin");
	}
});
function getUser (un)
{
	for (let i in users)
	{
		if (users[i].username==un)
		{
			return users[i];
		}
	}
}
app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
})

app.post ("/register", async(req, res) => {
	const un = req.body.username;
	const pw = req.body.password;
	const nm = req.body.fullname;
	const em = req.body.email;
	
	let insert = "INSERT INTO users(username,password,full_name,email,role_id) VALUES (";
	let values = `'${un}','${pw}','${nm}','${em}')`;
	const t = await query (insert+values);

	res.end("registered");
})
app.get ("/register", async(req, res) => {
	const un = req.query.un;
	const pw = req.query.pw;
	const nm = req.query.fn;
	const em = req.query.em;
	//register?un=test&pw=Test1234&fn=Tester&em=test@gmail.com
	let insert = "INSERT INTO users(username,password,full_name,email,role_id) VALUES (";
	let values = `'${un}','${pw}','${nm}','${em}',1)`;
	const t =await query (insert+values);

	res.end("registered");
})
app.post ("/updateUser", (req, res) => {
	const id = req.body.id
//	const un = req.body.username;
//	const pw = req.body.password;
	const fn = req.body.fullname;
	const em = req.body.email;
	
	let update = `UPDATE users SET fullname = '${fn}, email='${em}' WHERE id = ${id}`;
	query (update);
	res.end("updated");
})
app.get ("/updateUser", (req, res) => {
	const id = req.query.id
//	const un = req.body.username;
//	const pw = req.body.password;
	const fn = req.query.fn;
	const em = req.query.em;
	//updateUser?id=4&fn=June&em=test@june.com
	let update = `UPDATE users SET full_name = '${fn}', email='${em}' WHERE id = ${id}`;
	query (update);
	res.end("updated: "+update);
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
app.get('/directors', (req, res) => {
    res.json(directors)
})

app.get('/genre', (req, res) => {
    res.json(genre)
})
app.get('/movies', (req, res) => {
    res.json(movies)
})

app.get('/name', (req, res) => {
    res.json(name)
})

app.get('/director/:nm', (req, res) => {
	const nm = req.params.nm;
	console.log ("nm: "+nm);
	const d=getDirector(nm);
	res.json (d);
})
app.get('/movie/:id', (req, res) => {
	const id = req.params.id;
	console.log ("id: "+id);
	const m=getMovie(parseInt(id));
	res.json (m);
})
app.get('/addMovie/:un/:id', async(req, res) => {
	const un = req.params.un;
	const id = req.params.id;
	console.log ("id: "+id);
	const insert = `INSERT INTO user_movies (user_id, movie_id) VALUES (${un}, ${id})`;
	query (insert);
	res.end("added");
})
app.get('/removeMovie/:un/:id', (req, res) => {
	const id = req.params.id;
	const un = req.params.un;
	console.log ("id: "+id);
	const del = `DELETE FROM user_movies WHERE user_id =${un} AND movie_id = ${id}`;
	query (del);
	res.end("deleted");
})
app.get('/unregister', (req, res) => {
});
app.get('/genre/:g', (req, res) => {
	const g = req.params.g;
	console.log ("genre: "+g);
	let data=[];
	for (let i in movies)
	{
		if (movies[i].genre===g)
		{
			data.push(movies[i]);
		}
	}
	res.json (data);
})
function getDirector (name)
{
	for (let i in directors)
	{
		if (directors[i].name===name)
		{
			return directors[i];
		}
	}
}
function getMovie (id)
{
	for (let i in movies)
	{
		if (movies[i].id===id)
		{
			return movies[i];
		}
	}
}
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})
