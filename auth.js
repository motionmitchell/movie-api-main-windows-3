const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('./models');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
 
    },
    async (email, password, done) => {
      try {
        const fullname="";
        const birthday="";
        const user = await UserModel.create({ email, password, fullname, birthday });

        return done(null, user);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);
passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
			console.log("note found");
          return done(null, false, { message: 'User not found' });
        }
			
		if (user.password !==password) {
			console.log("invalid pwd");
          return done(null, false, { message: 'Wrong Password' });
        }

        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);