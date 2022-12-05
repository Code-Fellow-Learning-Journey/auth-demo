'use strict';

// 3rd party requirements
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const base64 = require('base-64');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3002

//DYNAMIC DAATABASE url for testing vs development
const DATABASE_URL = process.envNODE_ENV === 'test'
  ? 'sqlite:memory'
  : process.env.DATABASE_URL;


  // instantiating database
  const sequelizeDatabase = new Sequelize(DATABASE_URL);

  //set up cors
app.use(cors());

//access json from request body
app.use(express.json());

// process From input and add to request
app.use(express.urlencoded({extended:true}));

//creat user model
const UserModel = sequelizeDatabase.define('users', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

//sequelize allows to interact with the userModel BEFORE adding data to the database using the beforeCreate hook
UserModel.beforeCreate((user)=>{
  console.log('our user', user);
});

//middleware
async function basicAuth(req, res, next){
  let { authorization } = req.headers;
  console.log('authorization:::::', authorization);

  if(!authorization){
    res.status(401).send('Not Authorized!');
  }else{
    //console.log('I am here');
    let authString = authorization.split(' ')[1];

    let decodedAuthString = base64.decode(authString);
    console.log('decodedAuthString:', decodedAuthString);

    // extracting
    let [username, password] = decodedAuthString.split(':');
    console.log(username);
    console.log(password);

    //find user
    let user = await UsersModel.findOne({where: {username}});
    console.log('user from database', user);

    if(user){
      let validUser = await bcrypt.compare(password, user.password);
      console.log('validUser', validUser);
      if(validUser){
        req.user = user;
        next();

      }else {
        next('Not Authorized!');
      }
    }
  }
}

app.post('/signup', async (req, res, next) => {
  try {
    let{ username, password } = req.body;
    let encryptedPassword = await bcrypt.hash(password, 5);

    let user = await UserModel.create({
      username,
      password: encryptedPassword,
    });
    res.status(200).send(user);
  } catch (e) {
    next('signup error occured');
  }
});

app.post('/signin', basicAuth, (req, res, next) => {
  res.status(200).send(req.user);
});

module.exports = {
  app,
  start: () => app.listen(PORT, console.log('server running on port', PORT)),
  sequelizeDatabase,
};


