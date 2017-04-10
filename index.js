var path = require('path');
var express = require('express');
var app = express();

app.use(express.static(path.resolve(__dirname, 'public', 'build')));
app.listen(1337, () => console.log('Server is listening on', 1337));