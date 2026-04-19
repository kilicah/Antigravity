const http = require('http');

const putData = JSON.stringify({
  contractDate: "2023-10-10",
  sellerId: 1,
  buyerId: 2,
  currency: "USD",
  items: []
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/orders/2',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(putData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(putData);
req.end();
