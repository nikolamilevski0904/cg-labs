# Lab 5: Octahedron from BufferGeometry

`index.html` loads `main.js` (the crystal). `gltf.html` loads `gltf.js` (the GLTF model).

## Vertices (6)

The `positions` array holds 6 vertices, 3 floats (x, y, z) each:

| Index | Position | Meaning |
|-------|----------|---------|
| 0 | (0, 1.5, 0) | top |
| 1 | (0, -1.5, 0) | bottom |
| 2 | (1, 0, 0) | +x |
| 3 | (0, 0, 1) | +z |
| 4 | (-1, 0, 0) | -x |
| 5 | (0, 0, -1) | -z |

## Faces (8)

The `index` array has 24 numbers = 8 triangles. 4 triangles share the top vertex (0), 4 share the bottom vertex (1):

```
top:    (0,3,2) (0,4,3) (0,5,4) (0,2,5)
bottom: (1,2,3) (1,3,4) (1,4,5) (1,5,2)
```

Each triangle is listed counter-clockwise when seen from outside the shape. By the right-hand rule the normal of such a triangle points outward. Check for the first face (0,3,2): (v3 - v0) x (v2 - v0) = (0,-1.5,1) x (1,-1.5,0) = (1.5, 1, 1.5), which points away from the centre, so the face is front-facing from outside. The other 7 faces follow the same pattern.

## Indexed vs non-indexed

| | Indexed (`geometry`) | Non-indexed (`geometry.toNonIndexed()`) |
|---|---|---|
| Vertices stored | 6 | 24 (8 faces x 3 corners) |
| Faces | 8 | 8 |
| Index array | yes, 24 numbers | none, every 3 vertices form a triangle |
| Normals after `computeVertexNormals()` | one per shared vertex, averaged over the faces that touch it, so the shading is smooth | one per corner, equal to the face normal, so every face is flat |

Press `F` to toggle between the two. The console prints both vertex counts (6 and 24).

## Wrong winding order

The material uses the default `FrontSide`, so only triangles whose vertices appear counter-clockwise on screen are drawn. If a triangle is listed clockwise (for example `0, 2, 3` instead of `0, 3, 2`), its normal points inward and the face is culled: it becomes invisible and you see through it to the inside of the back faces. The fix is to swap two of its indices, which reverses the direction: `0, 2, 3` becomes `0, 3, 2`. (`side: THREE.DoubleSide` would also show it, but that hides the mistake and the lighting on the inner side is wrong.)
