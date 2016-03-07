// 'use strict';
const config = {
  env: process.env.NODE_ENV || 'development',
  cookie: {
    expire: 89
  },
  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: 'localhost',
  server_port: 3000
}
module.exports = config;
