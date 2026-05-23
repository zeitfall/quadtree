## Overview

A TypeScript implementation of a region-based QuadTree for spatial partitioning of 2D point data, supporting generic payloads, capacity-based subdivision, and depth-limiting.

## Mathematical & Algorithmic Properties

| Operation / Metric | Average Case | Worst Case |
| --- | --- | --- |
| Insertion | O(log n) | O(n) |
| Spatial Query | O(log n + k) | O(n) |
| Space Complexity | O(n) | O(n) |

*Note: `n` represents the total number of inserted points; `k` represents the number of points intersecting the query region.*

## API Reference

### `QuadTree<I unknown>`

The primary structural class representing a node within the spatial tree.

* **Constructor**
`constructor(boundary: QuadTreeBoundary, threshold: number, depth = 0, maxDepth = 8)`
Initializes a node with a defined spatial boundary, capacity threshold, current depth layer, and structural depth limit.
* **`insert(x: number, y: number, value: I): boolean`**
Inserts a point payload into the tree. Returns `true` if insertion succeeds, or `false` if the coordinates fall outside the node boundary.
* *Mechanism*: Governed by internal fields `#threshold`, `#depth`, and `#maxDepth`. If the node capacity exceeds `#threshold` and `#depth` is less than `#maxDepth`, `#subdivide()` is executed, transforming the leaf into an internal node and redistributing existing payloads to four child quadrants (`#nodeNW`, `#nodeNE`, `#nodeSW`, `#nodeSE`).


* **`query(region: QuadTreeRegion, result: QuadTreeInsertable<I>[]): void`**
Populates the `result` array with all payloads contained within the specified `QuadTreeRegion`. Evaluates intersection via `region.intersects` before performing point-in-boundary checks.
* **`clear(): void`**
Clears all internal point references and recursively clears child node instances.

### `QuadTreeBoundary`

Implements `QuadTreeRegion`. Defines the spatial bounding box for a node.

* **Constructor**
`constructor(x: number, y: number, width: number, height: number)`
Sets the origin coordinates (`x`, `y`) and spatial dimensions (`width`, `height`).
* **Properties**
`x: number`, `y: number`, `width: number`, `height: number`, `left: number`, `right: number`, `top: number`, `bottom: number`
* **`contains(x: number, y: number): boolean`**
Evaluates whether a point falls within the spatial boundaries.
* **`intersects(other: QuadTreeBoundary): boolean`**
Evaluates Axis-Aligned Bounding Box (AABB) intersection between two boundaries.

### `QuadTreeRegion`

An interface defining spatial bounds evaluation.

* **`contains(x: number, y: number): boolean`**
* **`intersects(boundary: QuadTreeBoundary): boolean`**

### `QuadTreeInsertable<I unknown>`

An interface representing the structured storage layout of data elements.

* **Properties**
`x: number`, `y: number`, `value: I`

---

## Operational Context (Behavioral Notes)

* **Boundary Conditions:** Coordinate boundaries evaluate containment using inclusive lower bounds and exclusive upper bounds: `[x, x + width)` and `[y, y + height)`.
* **Subdivision Behavior:** Structural subdivision is lazy. Node splitting occurs only when point allocations exceed the target node `#threshold`, provided the maximum structural depth limitation (`#maxDepth`) has not been reached.
* **Clearing Mechanics:** The `.clear()` routine executes a post-order traversal to empty local point arrays, unset structural split states, and nullify all internal child node pointers, freeing references for immediate garbage collection.

---

## Usage Example

```typescript
import { QuadTree, QuadTreeBoundary, QuadTreeInsertable } from './quadtree';

const boundary = new QuadTreeBoundary(0, 0, 200, 200);
const quadTree = new QuadTree<string>(boundary, 2, 0, 4);

quadTree.insert(10, 15, "Payload_A");
quadTree.insert(45, 80, "Payload_B");
quadTree.insert(12, 18, "Payload_C"); 

const queryRegion = new QuadTreeBoundary(0, 0, 50, 50);
const matchedPoints: QuadTreeInsertable<string>[] = [];

quadTree.query(queryRegion, matchedPoints);

```