const { exec } = require('@actions/exec');
const { sync: glob } = require('glob');
const getGzipSize = require('gzip-size');
const fs = require('fs');

module.exports = async function getAssetSizes(buildCommand, filePatterns) {
  await exec(buildCommand);

  let records = [];

  for (let filePattern of filePatterns) {
    let files = glob(filePattern);
    files.sort();

    let record = {
      filePattern,
      raw: 0,
      gzip: 0,
      files: [],
    };

    for (let file of files) {
      let gzip = await getGzipSize.file(file);
      record.gzip += gzip;

      let stat = fs.statSync(file);
      let raw = stat.size;
      record.raw += raw;

      record.files.push({ filePattern: file, raw, gzip });
    }

    records.push(record);
  }

  return records;
};
