class QuadTree<I = unknown> {
    #boundary: QuadTreeBoundary;
    #threshold: number;
    #depth: number;
    #maxDepth: number;

    #insertables: QuadTreeInsertable<I>[];
    #divided: boolean;

    #nodeNW: QuadTree<I> | null;
    #nodeNE: QuadTree<I> | null;
    #nodeSW: QuadTree<I> | null;
    #nodeSE: QuadTree<I> | null;

    constructor(boundary: QuadTreeBoundary, threshold: number, depth = 0, maxDepth = 8) {
        this.#boundary = boundary;
        this.#threshold = threshold;
        this.#depth = depth;
        this.#maxDepth = maxDepth;

        this.#insertables = [];
        this.#divided = false;

        this.#nodeNW = null;
        this.#nodeNE = null;
        this.#nodeSW = null;
        this.#nodeSE = null;
    }

    insert(x: number, y: number, value: I): boolean {
        const positionInsideBoundary = this.#boundary.contains(x, y);

        if (!positionInsideBoundary) {
            return false;
        }

        if (this.#divided) {
            return this.#tryInsertIntoChildren(x, y, value);
        }

        if (this.#insertables.length < this.#threshold || this.#depth >= this.#maxDepth) {
            this.#insertables.push({ x, y, value });

            return true;
        }

        this.#subdivide();

        for (const insertable of this.#insertables) {
            this.#tryInsertIntoChildren(insertable.x, insertable.y, insertable.value);
        }

        this.#insertables.length = 0;

        return this.#tryInsertIntoChildren(x, y, value);
    }

    query(region: QuadTreeRegion, result: QuadTreeInsertable<I>[]) {
        const regionIntersectsBoundary = region.intersects(this.#boundary);

        if (!regionIntersectsBoundary) {
            return;
        }

        if (this.#divided) {
            this.#nodeNW!.query(region, result);
            this.#nodeNE!.query(region, result);
            this.#nodeSW!.query(region, result);
            this.#nodeSE!.query(region, result);

            return;
        }

        for (const insertable of this.#insertables) {
            if (region.contains(insertable.x, insertable.y)) {
                result.push(insertable);
            }
        }
    }

    clear() {
        this.#insertables.length = 0;
        this.#divided = false;

        this.#nodeNW?.clear();
        this.#nodeNE?.clear();
        this.#nodeSW?.clear();
        this.#nodeSE?.clear();

        this.#nodeNW = null;
        this.#nodeNE = null;
        this.#nodeSW = null;
        this.#nodeSE = null;
    }

    #tryInsertIntoChildren(x: number, y: number, value: I) {
        return this.#nodeNW!.insert(x, y, value)
            || this.#nodeNE!.insert(x, y, value)
            || this.#nodeSW!.insert(x, y, value)
            || this.#nodeSE!.insert(x, y, value);
    }

    #subdivide() {
        const boundaryHalfWidth = this.#boundary.width / 2;
        const boundaryHalfHeight = this.#boundary.height / 2;
        const nodeNextDepth = this.#depth + 1;

        const northWestBoundary = new QuadTreeBoundary(
            this.#boundary.x,
            this.#boundary.y,
            boundaryHalfWidth,
            boundaryHalfHeight
        );
        this.#nodeNW = new QuadTree(northWestBoundary, this.#threshold, nodeNextDepth, this.#maxDepth);

        const northEastBoundary = new QuadTreeBoundary(
            this.#boundary.x + boundaryHalfWidth,
            this.#boundary.y,
            boundaryHalfWidth,
            boundaryHalfHeight
        );
        this.#nodeNE = new QuadTree(northEastBoundary, this.#threshold, nodeNextDepth, this.#maxDepth);

        const southWestBoundary = new QuadTreeBoundary(
            this.#boundary.x,
            this.#boundary.y + boundaryHalfHeight,
            boundaryHalfWidth,
            boundaryHalfHeight
        );

        this.#nodeSW = new QuadTree(southWestBoundary, this.#threshold, nodeNextDepth, this.#maxDepth);

        const southEastBoundary = new QuadTreeBoundary(
            this.#boundary.x + boundaryHalfWidth,
            this.#boundary.y + boundaryHalfHeight,
            boundaryHalfWidth,
            boundaryHalfHeight
        );
        this.#nodeSE = new QuadTree(southEastBoundary, this.#threshold, nodeNextDepth, this.#maxDepth);

        this.#divided = true;
    }
}

class QuadTreeBoundary implements QuadTreeRegion {
    #x: number;
    #y: number;
    #width: number;
    #height: number;

    #left: number;
    #right: number;
    #top: number;
    #bottom: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;

        this.#left = x;
        this.#right = x + width;
        this.#top = y;
        this.#bottom = y + height;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
    }

    get top() {
        return this.#top;
    }

    get bottom() {
        return this.#bottom;
    }

    contains(x: number, y: number) {
        return x >= this.#left
            && x < this.#right
            && y >= this.#top
            && y < this.#bottom;
    }

    intersects(other: QuadTreeBoundary) {
        return this.#left < other.#right
            && this.#right > other.#left
            && this.#top < other.#bottom
            && this.#bottom > other.#top;
    }
}

interface QuadTreeRegion {
    contains(x: number, y: number): boolean;
    intersects(boundary: QuadTreeBoundary): boolean;
}

interface QuadTreeInsertable<I = unknown> {
    x: number;
    y: number;
    value: I;
}

export {
    QuadTree,
    QuadTreeBoundary,
    type QuadTreeRegion,
    type QuadTreeInsertable
};
