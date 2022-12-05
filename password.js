'use strict';


let base64 = require('base-64');
let bcrypt = require('bcrypt');

console.log('-----------BASE 64--------');

let str = 'Hunter pass 123';
let encodedStr = base64.encode(str);
let decodedStr = base64.decode(encodedStr);

console.log('str', str);
console.log('encodedStr:', encodedStr);
console.log('decodedStr:', decodedStr);

console.log ('------------HASHING WITH BCRYPT-------');


let password = 'pass123';
let complexity = 5;

encrypt(password, complexity);

async function encrypt(password, complexity){
  let hashedPassword = await bcrypt.hash(password, complexity);
  console.log(hashedPassword);
}
