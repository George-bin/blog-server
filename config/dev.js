const os = require('os');
module.exports =  {
  host: 'localhost',
  port: '10023',
  // 服务器跨域设置
  cors: 'http://localhost:3000',
  NODE_ENV: 'development',
  isMac: os.type() === 'Darwin' ? true : false
}
