const os = require('os');
module.exports =  {
  host: '39.105.55.137',
  port: '10023',
  // 服务器跨域设置
  cors: 'http://localhost:3000',
  NODE_ENV: 'production',
  isMac: os.type() === 'Darwin' ? true : false
}
