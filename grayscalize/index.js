const fetch = require('node-fetch');
const util = require('util');
const fs = require('fs');
const crypto = require('crypto');
const cv = require('opencv4nodejs');
const mime = require('mime-types');
const stream = require('stream');

const streamPipeline = util.promisify(stream.pipeline);
const S = "abcdef0123456789";
const N = 32;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const image_url = req.query.image_url || req.params.image_url || 'https://user-images.githubusercontent.com/4566555/66614178-ed7d1c80-ec02-11e9-8b22-4560309db118.png';
    const response = await fetch(image_url);
	
	if (!response.ok) {
        throw new Error(`unexpected response ${response.statusText}`);
    }
    const ext = image_url.replace(/^.*\.([^\.]*)$/, "$1")
    const tmpfilename = Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('');
    await streamPipeline(response.body, fs.createWriteStream(`/tmp/${tmpfilename}.${ext}`));
    await cv.imwriteAsync(`/tmp/gray_${tmpfilename}.${ext}`, (await cv.imreadAsync(`/tmp/${tmpfilename}.${ext}`)).cvtColor(cv.COLOR_BGR2GRAY));

    context.res = {
        headers: {
            "Content-Type": mime.contentType(ext)
        },
        body: await fs.promises.readFile(`/tmp/gray_${tmpfilename}.${ext}`)
    };
}