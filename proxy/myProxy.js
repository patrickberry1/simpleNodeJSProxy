//
//Module Imports
//
var util = require('util'),
    http = require('http'),
    url = require('url'),
    request = require('request'),
    readline = require('readline');
//
//Variable Declarations
//
    var server = http.createServer();
    var blacklist = [];

//
//Functon to check if a url is blacklisted
//
    function blacklisted(host){
      for(var i=0; i<blacklist.length; i++){
        if(host == blacklist[i]){
          return true;
        }
        console.log(host + " != " + blacklist[i]);
      }
      return false;
    }
//
//Server listening to port 8080
//
    server.listen(8080,function(){
    	console.log('Proxy listening on port 8080');
    });
//
//Http request handling
//
    server.on('request', function(req,res){
      var server_url = req.url;
      var buf = [];

      if(!blacklisted(req.headers.host)){
        console.log("http://" + request.get(server_url).host + request.get(server_url).path);
        request.get(server_url).pipe(res, {end: true});
      }
      else{
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Site Blocked By Proxy');
      }

      // res.on('data', function(chunk){
      //   buf.push(chunk);
      // });
      //
      // res.on('end', function(){
      //   console.log(buf.toString());
      // });

      //console.log(req.headers.host);
    });

//
//Https request handling
//

server.on('connect', function(req, socket, bodyhead) {
  var hostPort = getHostPortFromString(req.url, 443);
  var hostDomain = hostPort[0];
  var port = parseInt(hostPort[1]);
  console.log("Proxying HTTPS request for:", hostDomain, port);

  var pSocket = new net.Socket();
  pSocket.connect(port, hostDomain, function () {
      pSocket.write(bodyhead);
      socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    }
  );

  pSocket.on('data', function (chunk) {
    socket.write(chunk);
  });

  pSocket.on('end', function () {
    socket.end();
  });

  pSocket.on('error', function () {
    socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
    socket.end();
  });

  socket.on('data', function (chunk) {
    pSocket.write(chunk);
  });

  socket.on('end', function () {
    pSocket.end();
  });

  socket.on('error', function () {
    pSocket.end();
  });

});

//
//Console input handling
//
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', function(line){
      blacklist.push(line);
      console.log(blacklist.toString());
    })
