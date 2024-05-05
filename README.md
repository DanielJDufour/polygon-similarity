# polygon-similarity
> quick comparison of polygons using rasterization

## advantages
- optimized for speed
- result is a score between 0 and 1
- no configuration required
- predictable linear run-time

## score
The score is basically a modified [Jaccard similarity coefficient](https://en.wikipedia.org/wiki/Jaccard_index).
The geometries are converted to an in-memory raster representation using the [dufour-peyton-intersection](https://github.com/GeoTIFF/dufour-peyton-intersection) algorithm.
Pixels that fall within a geometry are represented as `1` and 
pixels that fall outside are represented as `0`.
We count all the pixels that have a value of `1` for both bands and divide that
by the total number of pixels that have a value of `1` for at least one of the bands.

## usage
```js
import { compare } from "polygon-similarity";

const a = { "type": "Polygon", "coordinates": [[[30,10],[40,40],[20,40],[10,20],[30,10]]] };

const b = { "type": "Polygon", "coordinates": [[[29.93,10.49],[40.44,39.76],[20.39,40.31],[10.45,20.20],[29.93,10.49]]] };

compare(a, b);
{
  // modified Jaccard similarity coefficient
  "score": 0.9565577847786437,

  "counts": {
    "0:0": 3969,  // both outside
    "1:1": 5769,  // both inside
    "1:0": 179,   // only first inside
    "0:1": 83     // only second inside
  }
}
```