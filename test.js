const fs = require("fs");
const test = require("flug");
const randomShift = require("geojson-random-shift");
const { compare } = require("./src/index.js");

const readJSON = (fp) => JSON.parse(fs.readFileSync(fp, "utf-8"));

const polygon = readJSON("./test-data/geojson-test-data/wikipedia/primitives/Polygon.geojson");

const sum = (arr) => arr.reduce((acc, it) => acc + it, 0);
const mean = (arr) => sum(arr) / arr.length;

test("example", ({ eq }) => {
  const a = {
    type: "Polygon",
    coordinates: [
      [
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10]
      ]
    ]
  };

  const b = {
    type: "Polygon",
    coordinates: [
      [
        [29.93, 10.49],
        [40.44, 39.76],
        [20.39, 40.31],
        [10.45, 20.2],
        [29.93, 10.49]
      ]
    ]
  };

  const comparison = compare(a, b);
  console.log(JSON.stringify(comparison, undefined, 2));
});

test("shift and sort geojson polygons", ({ eq }) => {
  const all_mean_scores = [];
  for (let i = 1; i <= 10; i++) {
    const distance = i * 0.5;

    // we compute the average similarity among 10 randomly shifted polygons,
    // because there's some randomness in how similar a polygon is after
    // the vertices are randomly shifted
    const scores = [];
    for (let ii = 0; ii < 50; ii++) {
      const polygonShifted = randomShift(polygon, {
        range: [distance, distance]
      });
      if (i == 1 && ii == 0) {
        console.log(JSON.stringify(polygon));
        console.log(JSON.stringify(polygonShifted));
      }
      const similarity = compare(polygon, polygonShifted).score;
      scores.push(similarity);
    }

    const mean_similarity = mean(scores);
    all_mean_scores.push({ i, distance, mean_similarity });
  }

  all_mean_scores.sort((a, b) => b.mean_similarity - a.mean_similarity);
  const original_indices = all_mean_scores.map((it) => it.i);
  eq(original_indices, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
