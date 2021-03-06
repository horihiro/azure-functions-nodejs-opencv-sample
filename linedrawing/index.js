const fs = require('fs');
const cv = require('opencv4nodejs');
const mime = require('mime-types');
const { downloadFromUrl } = require('../common/utils');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const image_url = req.query.image_url || req.params.image_url || 'https://user-images.githubusercontent.com/4566555/66614178-ed7d1c80-ec02-11e9-8b22-4560309db118.png';
    const ext = image_url.replace(/^.*\.([^\.]*)$/, "$1")
    const tmpfilename = await downloadFromUrl(image_url);
    const kernel = new cv.Mat([
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ], cv.CV_8U);
    const img_gray = (await cv.imreadAsync(`/tmp/${tmpfilename}.${ext}`)).cvtColor(cv.COLOR_RGBA2GRAY);
    await cv.imwriteAsync(
        `/tmp/linedrawing_${tmpfilename}.${ext}`,
        img_gray
            .dilate(kernel, new cv.Point2(-1, 1), 1)
            .absdiff(img_gray)
            .bitwiseNot()
    );

    context.res = {
        headers: {
            "Content-Type": mime.contentType(ext)
        },
        body: await fs.promises.readFile(`/tmp/linedrawing_${tmpfilename}.${ext}`)
    };
}