var express = require('express');
var router = express.Router();

/* GET new user. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
