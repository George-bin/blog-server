const os = require('os');
let dev = require('./dev');
let pro = require('./pro');

let config = os.type() === 'Linux' ? pro : dev;
module.exports = config;
