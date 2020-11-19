/*
 * @Author: Jinqi Li
 * @Date: 2020-10-27 09:40:33
 * @LastEditors: Jinqi Li
 * @LastEditTime: 2020-10-27 09:46:34
 * @FilePath: /demos/demo-node/app.js
 */
var express = require('express');
var app = express();
app.get('/', (req, res) => {
	res.send('Hello World!');
});
app.listen(5000, () => {
	console.log('app is listening on port 5000');
});
