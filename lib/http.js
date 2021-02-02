"use strict";

/**
 * A promise-based interface for http requests. Currently handles only GET over
 * HTTPS; augment as necessary.
 */

const https = require('https');

function get(uri, headers = {}) {
  const opts = { headers: { Connection: "keep-alive", ...headers } };

  return new Promise((resolve, reject) => {
    https.get(uri, opts, response => {
      const { statusCode: status, headers } = response;

      response.setEncoding('utf8');
      let bodyStr = "";
      response.on('data', data => { bodyStr += data; });

      response.on('end', () => {
        resolve({ uri, status, headers, bodyStr });
      });

    }).on('error', e => reject(e));
  });
}

function post(uri, headers = {}) {
  const opts = { method: 'POST', headers: { Connection: "keep-alive", ...headers } }

  return new Promise(resolve => {
    https.get(uri, opts, response => {
      const { statusCode: status, headers } = response

      response .setEncoding('utf8')
      let bodyStr = ""
      response.on('data', data => { bodyStr += data })

      response.on('end', () => {
        resolve({ uri, status, headers, bodyStr })
      }) // response.on('end')
    }) // https.post(uri, opts, response)
  }) // return new Promise()
}

module.exports = { get, post };