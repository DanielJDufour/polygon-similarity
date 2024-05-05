const bboxCalc = require("bbox-fns/calc");
const merge = require("bbox-fns/merge");
const { calculate } = require("dufour-peyton-intersection");

function compare_row(a_ranges, b_ranges, min, max) {
  const len = max - min + 1; // + 1 because inclusive

  // inflate array of ranges into a full row of pixel values
  const a = new Array(len).fill(0);
  a_ranges.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) a[i] = 1;
  });

  // inflate array of ranges into a full row of pixel values
  const b = new Array(len).fill(0);
  b_ranges.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) b[i] = 1;
  });

  const counts = { "0:0": 0, "1:1": 0, "1:0": 0, "0:1": 0 };
  for (let i = 0; i < len; i++) {
    counts[a[i] + ":" + b[i]]++;
  }

  return counts;
}

function compare(a, b, { debug_level = 0, size } = {}) {
  // check if bounding boxes even intersect
  const a_bbox = a.bbox || bboxCalc(a);
  if (debug_level >= 2) console.log("[polygon-similarity] a_bbox:", a_bbox);

  const b_bbox = b.bbox || bboxCalc(b);
  if (debug_level >= 2) console.log("[polygon-similarity] b_bbox:", b_bbox);

  const [columns, rows] = size || [100, 100];
  if (debug_level >= 2) console.log("[polygon-similarity] columns:", columns);
  if (debug_level >= 2) console.log("[polygon-similarity] rows:", rows);

  const overall_bbox = merge([a_bbox, b_bbox]);
  if (debug_level >= 2) console.log("[polygon-similarity] overall_bbox:", overall_bbox);

  const arows = calculate({
    raster_bbox: overall_bbox,
    raster_height: rows,
    raster_width: columns,
    geometry: a
  }).rows;
  if (debug_level >= 2) console.log("[polygon-similarity] arows:", arows);

  const brows = calculate({
    raster_bbox: overall_bbox,
    raster_height: rows,
    raster_width: columns,
    geometry: b
  }).rows;
  if (debug_level >= 2) console.log("[polygon-similarity] brows:", brows);

  const all_counts = {
    "0:0": 0,
    "1:1": 0,
    "1:0": 0,
    "0:1": 0
  };
  for (let r = 0; r < rows; r++) {
    const arow = arows[r] || [];
    const brow = brows[r] || [];
    const row_counts = compare_row(arow, brow, 0, columns - 1);
    if (debug_level >= 5) console.log("[polygon-similarity] row_counts:", row_counts);
    for (let key in row_counts) {
      all_counts[key] += row_counts[key] || 0;
    }
  }
  if (debug_level >= 5) console.log("[polygon-similarity] all_counts:", all_counts);

  return {
    // https://en.wikipedia.org/wiki/Jaccard_index
    // jaccard similarity where sets are all pixels that are "inside" in either one or both raster
    score: all_counts["1:1"] / (all_counts["1:1"] + all_counts["1:0"] + all_counts["0:1"]),
    counts: all_counts,
    bbox: overall_bbox,
    bboxes: [a_bbox, b_bbox],
    size: [columns, rows]
  };
}

module.exports = { compare };
