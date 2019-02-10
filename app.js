var express = require('express');
var session = require('express-session');
var mysql = require('mysql');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
var bodyParser = require("body-parser");
var TWO_Hours = 1000 * 60 * 60 * 2; //2 hours in milliseconds

app.use(bodyParser.urlencoded({
	extended:true
}))

const{
	PORT = 3000,
	NODE_ENV = 'development',

	SESS_NAME = 'sid',
	SESS_SEECRET = 'issh!quiet, it\'asecret!',
	SESS_LIFETIME = TWO_Hours
} = process.env

server.listen(PORT,() =>{
	console.log('Server started on port 3000');
}); 

var IN_PROD = NODE_ENV === "production"

var users = [
	{id: 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret'},
	{id: 2, name: 'Max', email: 'Max@gmail.com', password: 'secret'},
	{id: 3, name: 'Hagard', email: 'Hagard@gmail.com', password: 'secret'},
]

app.use(session({
	name: SESS_NAME,
	resave: false,
	saveUninitialized: false,
	secret: SESS_SEECRET,
	cookie: {
		maxAge: SESS_LIFETIME,
		sameSite: true,
		secure: IN_PROD,//true in production

	}
  }))


app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

const redirectLogin = (req, res, next) => {
	if(!req.session.userId){
		res.redirect('/login')
	}
	else{
		next()
	}
}

const redirectHome = (req, res, next) => {
	if(!req.session.userId){
		res.redirect('/home')
	}
	else{
		next()
	}
}



app.get('/',(req,res) =>{
	//res.render('clothingPage');
	const {userId } = req.session
	//const userId = 1;
	console.log(userId),
	res.send(`
		<h1>Welcome</h1>
		${userId ?
			`<a href='/home'>home</a>
			<form method='post' action='/logout'>
				<button>Logout</button>
			</form>
			`
		:	`
			<a href='/login'>login</a>
			<a href='/register'>register</a>
		`}
		`
	)
})

// app.use( (req,res,next) => {
// 	const {userId} = req.session
// 	if (userId){
// 		res.locals.user = users.find(
// 			user => user.id === userId
// 		)
// 	}
// 	next()
// })

app.get('/home', (req, res) => {
	 const user = users.find(user => user.id === req.session.userId);
	 console.log("userId " + req.session.userId);
	 //const userName = user.name;
	// console.log("username " + userName);
	// const userEmail = user.email;
	 res.render('home',{userName: user.name, userEmail: user.email});
	//res.render('home');
});
 

app.get('/login',(req,res) =>{
	res.render('login');
});

app.get('/testtt',(req,res) =>{
	res.render('testtt');
});

app.get('/register',(req,res) =>{
	res.render('register');
});

app.get('/loginSignUpPage',(req,res) =>{
	res.render('loginSignUpPage');
});


app.get('/sideNavMobile',(req,res) =>{
	res.render('sideNavMobile');
});

app.post('/loginSignUpPage',(req,res) =>{
	const {email, password} = req.body
	if(email && password){
		const user = users.find(
			user => user.email === email && user.password === password 
		)	
		if(user){
			req.session.userId = user.id
			console.log("the user id is "+user.id)
			return res.redirect('/clothingPage')
		}
	}
	res.redirect('/loginSignUpPage')
});

app.post('/login',(req,res) =>{
	const {email, password} = req.body
	if(email && password){
		const user = users.find(
			user => user.email === email && user.password === password 
		)	
		if(user){
			req.session.userId = user.id
			console.log("the user id is "+user.id)
			return res.redirect('/home')
		}
	}
	res.redirect('/login')
});

app.post('/register', redirectHome,(req,res) =>{
	const {name, email, password} = req.body

	if(name && email && password){
		const exists = users.some(
			user => user.email === email		
		)	

		if(!exists){
			const user = {
				id: users.length + 1,
				name,
				email,
				password
			}

			user.push(user)
			req.session.userId = user.id
			return res.redirect('/home')
		}
	}
	res.redirect('/register')
});

app.post('/logout', redirectLogin,(req,res) =>{
	req.session.destroy(err => {
		if(err){
			return res.redirect('/home')
		}
		res.clearCookie(SESS_NAME)
		res.redirect('/loginSignUpPage')
	})
});





app.get('/index1',(req,res) =>{
	res.render('index1');
});

app.get('/homePage',(req,res) =>{
	res.render('homePage');
});

app.get('/clothingPage',(req,res) =>{
	res.render('clothingPage');
});

app.get('/test',(req,res) =>{
	res.render('test');
});


