"use strict";

require('dotenv').config();

var Imap = require('imap');

var imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
});
imap.once('ready', function () {
  console.log('✅ IMAP login success!');
  imap.end();
});
imap.once('error', function (err) {
  return console.error('❌ IMAP Error:', err);
});
imap.connect();