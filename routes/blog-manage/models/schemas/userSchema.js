const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  password: String
}, {collection: 'adminUser'});

// export default userSchema;
exports.User = mongoose.model('adminUser', userSchema)