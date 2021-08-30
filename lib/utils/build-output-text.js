const prettyBytes = require('pretty-bytes');

function markdownTable(data) {
  let table = `File(s) | Gzipped | Raw | Gzipped +/-
--- | --- | --- | ---`;

  data.forEach((record) => {
    table += `\n${[
      record.filePattern,
      prettyBytes(record.gzip),
      prettyBytes(record.raw),
      prettyBytes(record.gzipDiff, { signed: true }),
    ].join(' | ')}`;
  });

  return table;
}

function markdownDetails(data, button = 'Show breakdown per file') {
  return `<details>
  <summary>
    ${button}
  </summary>

${data}
</details>`;
}

function getDiffs(prAssets, mainAssets) {
  return prAssets.map((prAsset) => {
    let mainAsset = mainAssets.find(
      (mainAsset) => mainAsset.filePattern === prAsset.filePattern
    );

    return {
      filePattern: prAsset.filePattern,
      gzip: prAsset.gzip,
      raw: prAsset.raw,
      gzipDiff: prAsset.gzip - mainAsset.gzip,
      rawDiff: prAsset.raw - mainAsset.raw,
      filesDiff: prAsset.files
        ? getDiffs(prAsset.files, mainAsset.files)
        : undefined,
    };
  });
}

module.exports = function buildOutputText(prAssets, mainAssets) {
  let diffs = getDiffs(prAssets, mainAssets);

  console.log(diffs);

  let outputParts = [];
  diffs.forEach((diff) => {
    if (diff.gzipDiff > 100) {
      // larger
      outputParts.push(`🚨 \`${diff.filePattern}\` got bigger:`);
    } else if (diff.gzipDiff < -100) {
      // smaller
      outputParts.push(`🎉 \`${diff.filePattern}\` got smaller:`);
    } else {
      // same size
      outputParts.push(`🤷 \`${diff.filePattern}\` stayed the same size:`);
    }

    outputParts.push(markdownTable([diff]));
    outputParts.push(markdownDetails(markdownTable(diff.filesDiff)));
    outputParts.push('');
  });

  return outputParts.join('\n');
};
