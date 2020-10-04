const fetch = require('node-fetch');
const util = require('util');
const fs = require('fs');
const crypto = require('crypto');

const stream = require('stream');

const streamPipeline = util.promisify(stream.pipeline);
const S = "abcdef0123456789";
const N = 32;

const downloadFromUrl = async (url) => {
    const response = await fetch(url);
	
	if (!response.ok) {
        throw new Error(`unexpected response ${response.statusText}`);
    }
    const ext = url.replace(/^.*\.([^\.]*)$/, "$1")
    const tmpfilename = Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('');
    await streamPipeline(response.body, fs.createWriteStream(`/tmp/${tmpfilename}.${ext}`));
    return tmpfilename;
}

module.exports = {
    downloadFromUrl
}