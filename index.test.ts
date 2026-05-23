import { it, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

import {
    QuadTree,
    QuadTreeBoundary,
    type QuadTreeInsertable
    // @ts-ignore
} from './index.ts';

class TestRegion {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(x: number, y: number): boolean {
        return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
    }

    intersects(boundary: QuadTreeBoundary): boolean {
        return this.x < boundary.right &&
            this.x + this.width > boundary.left &&
            this.y < boundary.bottom &&
            this.y + this.height > boundary.top;
    }
}

describe('QuadTree', () => {
    let quadTreeBoundary: QuadTreeBoundary;
    let quadTree: QuadTree<string>;

    beforeEach(() => {
        quadTreeBoundary = new QuadTreeBoundary(0, 0, 100, 100);
        quadTree = new QuadTree<string>(quadTreeBoundary, 2);
    });

    it('should successfully insert points within boundaries', () => {
        const inserted1 = quadTree.insert(10, 10, 'Point A');
        const inserted2 = quadTree.insert(50, 50, 'Point B');

        assert.strictEqual(inserted1, true);
        assert.strictEqual(inserted2, true);
    });

    it('should fail to insert points outside boundaries', () => {
        const insertedOutside = quadTree.insert(150, 50, 'Outside');
        const insertedNegative = quadTree.insert(-10, 20, 'Negative');

        assert.strictEqual(insertedOutside, false);
        assert.strictEqual(insertedNegative, false);
    });

    it('should subdivide when threshold is exceeded', () => {
        quadTree.insert(10, 10, 'NW Point');
        quadTree.insert(60, 10, 'NE Point');

        const insertedThird = quadTree.insert(10, 60, 'SW Point');
        assert.strictEqual(insertedThird, true);

        const nwResult: QuadTreeInsertable<string>[] = [];
        const nwRegion = new TestRegion(0, 0, 50, 50);

        quadTree.query(nwRegion, nwResult);

        assert.strictEqual(nwResult.length, 1);
        assert.strictEqual(nwResult[0]?.value, 'NW Point');

        const swResult: QuadTreeInsertable<string>[] = [];
        const swRegion = new TestRegion(0, 50, 50, 50);

        quadTree.query(swRegion, swResult);

        assert.strictEqual(swResult.length, 1);
        assert.strictEqual(swResult[0]?.value, 'SW Point');
    });

    it('should respect maxDepth and not subdivide further', () => {
        const flatTree = new QuadTree<string>(quadTreeBoundary, 1, 0, 0);

        const inserted1 = flatTree.insert(10, 10, 'A');
        const inserted2 = flatTree.insert(20, 20, 'B');
        const inserted3 = flatTree.insert(30, 30, 'C');

        assert.strictEqual(inserted1, true);
        assert.strictEqual(inserted2, true);
        assert.strictEqual(inserted3, true);

        const result: QuadTreeInsertable<string>[] = [];

        flatTree.query(new TestRegion(0, 0, 100, 100), result);

        assert.strictEqual(result.length, 3);
    });

    it('should return only points within the queried region', () => {
        quadTree.insert(10, 10, 'Target 1');
        quadTree.insert(20, 20, 'Target 2');
        quadTree.insert(80, 80, 'Far point');

        const result: QuadTreeInsertable<string>[] = [];
        const queryRegion = new TestRegion(0, 0, 30, 30);

        quadTree.query(queryRegion, result);

        assert.strictEqual(result.length, 2);

        const values = result.map(r => r.value);

        assert.ok(values.includes('Target 1'));
        assert.ok(values.includes('Target 2'));
        assert.ok(!values.includes('Far point'));
    });

    it('should clear all nodes and elements', () => {
        quadTree.insert(10, 10, 'A');
        quadTree.insert(60, 60, 'B');
        quadTree.insert(20, 80, 'C');

        quadTree.clear();

        const result: QuadTreeInsertable<string>[] = [];

        quadTree.query(new TestRegion(0, 0, 100, 100), result);

        assert.strictEqual(result.length, 0);
    });
});

describe('QuadTreeBoundary', () => {
    it('contains method checks bounds correctly', () => {
        const b = new QuadTreeBoundary(10, 10, 20, 20);

        assert.strictEqual(b.contains(15, 15), true);
        assert.strictEqual(b.contains(10, 10), true);
        assert.strictEqual(b.contains(30, 15), false);
        assert.strictEqual(b.contains(15, 30), false);
    });

    it('intersects method detects overlapping boundaries', () => {
        const b1 = new QuadTreeBoundary(0, 0, 50, 50);
        const b2 = new QuadTreeBoundary(25, 25, 50, 50);
        const b3 = new QuadTreeBoundary(60, 60, 10, 10);

        assert.strictEqual(b1.intersects(b2), true);
        assert.strictEqual(b1.intersects(b3), false);
    });
});
