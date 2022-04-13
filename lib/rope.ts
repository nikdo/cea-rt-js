/*
  Note: this file is in typescript, but you do not need to use typings if you don't want.

  The type annotations are just there in case they are helpful.
*/

type MapBranch = {
  left?: MapRepresentation,
  right?: MapRepresentation,
  size: number,
  kind: 'branch'
}
type MapLeaf = {
  text: string,
  kind: 'leaf'
}
type MapRepresentation = MapBranch | MapLeaf

interface IRope {
  toString: () => string,
  size: () => number,
  height: () => number,
  toMap: () => MapRepresentation,
  isBalanced: () => Boolean
}

export class RopeLeaf implements IRope {
  text: string;

  // Note: depending on your implementation, you may want to to change this constructor
  constructor(text: string) {
    this.text = text;
  }

  // just prints the stored text
  toString(): string {
    return this.text
  }

  size() {
    return this.text.length;
  }

  height() {
    return 1;
  }

  toMap(): MapLeaf {
    return {
      text: this.text,
      kind: 'leaf'
    }
  }

  isBalanced() {
    return true;
  }
}

export class RopeBranch implements IRope {
  left: IRope;
  right: IRope;
  cachedSize: number;

  constructor(left: IRope, right: IRope) {
    this.left = left;
    this.right = right;
    // Please note that this is defined differently from "weight" in the Wikipedia article.
    // You may wish to rewrite this property or create a different one.
    this.cachedSize = (left ? left.size() : 0) +
      (right ? right.size() : 0)
  }

  // how deep the tree is (I.e. the maximum depth of children)
  height(): number {
    return 1 + Math.max(this.leftHeight(), this.rightHeight())
  }

  // Please note that this is defined differently from "weight" in the Wikipedia article.
  // You may wish to rewrite this method or create a different one.
  size() {
    return this.cachedSize;
  }

  /*
    Whether the rope is balanced, i.e. whether any subtrees have branches
    which differ by more than one in height.
  */
  isBalanced(): boolean {
    const leftBalanced = this.left ? this.left.isBalanced() : true
    const rightBalanced = this.right ? this.right.isBalanced() : true

    return leftBalanced && rightBalanced
      && Math.abs(this.leftHeight() - this.rightHeight()) < 2
  }

  getLeft(): IRope {
    return this.left;
  }

  getRight(): IRope {
    return this.right;
  }

  leftHeight(): number {
    if (!this.left) return 0
    return this.left.height()
  }

  rightHeight(): number {
    if (!this.right) return 0
    return this.right.height()
  }

  // Helper method which converts the rope into an associative array
  //
  // Only used for debugging, this has no functional purpose
  toMap(): MapBranch {
    const mapVersion: MapBranch = {
      size: this.size(),
      kind: 'branch'
    }
    if (this.right) mapVersion.right = this.right.toMap()
    if (this.left) mapVersion.left = this.left.toMap()
    return mapVersion
  }

  toString(): string {
    return (this.left ? this.left.toString() : '')
      + (this.right ? this.right.toString() : '')
  }
}


export function createRopeFromMap(map: MapRepresentation): IRope {
  if (map.kind == 'leaf') {
    return new RopeLeaf(map.text)
  }

  let left, right = null;
  if (map.left) left = createRopeFromMap(map.left)
  if (map.right) right = createRopeFromMap(map.right)
  return new RopeBranch(left, right);
}

export function concat(left: IRope, right: IRope): IRope {
  return new RopeBranch(left, right);
}

function isLeaf(rope: IRope) {
  return rope.height() == 1
}

// position = 0-based index; part of the left rope
export function splitAt(rope: IRope, position: number): { left: IRope, right: IRope } {
  if (isLeaf(rope)) {
    const text = rope.toString();
    if (position >= text.length - 1) throw new Error("position not within the string")
    return {
      left: new RopeLeaf(text.substring(0, position + 1)),
      right: new RopeLeaf(text.substring(position + 1, text.length))
    }
  }
  else {
    const branch = rope as RopeBranch;
    if (position >= branch.size()) {
      return {
        left: branch;
        right: undefined;
      }
    } else {
      // TODO: is this OK to fetch like this?
      const left = branch.getLeft();
      const right = branch.getRight();
      return {
        // TODO... :/
        left: position >= left.size ? branch : splitAt(branch, position).left,
        right: position >= right.size ? branch : splitAt(branch, position)
      }
  };
}

// start = 0-based index; included in deletion
// end = 0-based index; excluded from deletion
export function deleteRange(rope: IRope, start: number, end: number): IRope {
  const left = splitAt(rope, start).left;
  const right = splitAt(rope, end).right;
  return concat(left, right);
}

export function insert(rope: IRope, text: string, location: number): IRope {
  const pair = splitAt(rope, location);
  return concat(concat(pair.left, text), pair.right);
}

export function rebalance(rope: IRope): IRope {
  // TODO
}
