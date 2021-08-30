const prettyBytes = require('pretty-bytes');

function markdownTable(data) {
  let table = `File(s) | Gzipped | +/- | Raw
--- | --- | --- | ---`;

  data.forEach((record) => {
    table += `\n${[
      record.filePattern,
      prettyBytes(record.gzip),
      prettyBytes(record.gzipDiff, { signed: true }),
      prettyBytes(record.raw),
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
  let filePatterns = Array.from(
    new Set(
      prAssets
        .map((prAsset) => prAsset.filePattern)
        .concat(mainAssets.map((mainAsset) => mainAsset.filePattern))
    )
  );

  return filePatterns.map((filePattern) => {
    let prAsset = prAssets.find(
      (prAsset) => prAsset.filePattern === filePattern
    );
    let mainAsset = mainAssets.find(
      (mainAsset) => mainAsset.filePattern === filePattern
    );

    return {
      filePattern,
      gzip: prAsset ? prAsset.gzip : 0,
      raw: prAsset ? prAsset.raw : 0,
      gzipDiff: (prAsset ? prAsset.gzip : 0) - (mainAsset ? mainAsset.gzip : 0),
      filesDiff:
        prAsset && prAsset.files
          ? getDiffs(prAsset.files, mainAsset ? mainAsset.files : [])
          : undefined,
    };
  });
}

module.exports = function buildOutputText(prAssets, mainAssets) {
  let diffs = getDiffs(prAssets, mainAssets);

  let outputParts = [];
  diffs.forEach((diff) => {
    if (diff.gzipDiff > 10) {
      // larger
      outputParts.push(`🚨 \`${diff.filePattern}\` got bigger:`);
    } else if (diff.gzipDiff < -10) {
      // smaller
      outputParts.push(`🎉 \`${diff.filePattern}\` got smaller:`);
    } else {
      // same size
      outputParts.push(`🤷 \`${diff.filePattern}\` stayed the same size:`);
    }

    outputParts.push(markdownTable([diff]));
    outputParts.push(markdownDetails(markdownTable(diff.filesDiff)));
    outputParts.push('');
    outputParts.push('---');
    outputParts.push('');
  });

  return outputParts.join('\n');
};
