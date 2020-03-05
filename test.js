console.log("EUREKA");

//let express = require("express");
//let By = require("selenium-webdriver").By;
//let until = require("selenium-webdriver").until;
//let phantomjs = require("selenium-webdriver/phantomjs");
//let phantomjsnew = require("/usr/local/bin/phantomjs");

let express = require("express");
let test = require("selenium-webdriver");
let phantomjs = require("phantomjs-prebuilt");

let app = express();
let driver = new phantomjs.arch.Driver();

console.log("EUREKA AGAIN");