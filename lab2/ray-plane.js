import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100)
camera.position.set(6, 5, 8)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)
const controls = new OrbitControls(camera, renderer.domElement)

// Plane: all points x with n . x = d (n = normal, p0 = a point on the plane)
const n = new THREE.Vector3(0, 1, 0)
const p0 = new THREE.Vector3(0, 0, 0)
const d = n.dot(p0)

// Visible floor, rotated so its normal (+z by default) becomes +y
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshBasicMaterial({ color: 0x2a3140 })
)
floor.rotation.x = -Math.PI / 2
floor.updateMatrixWorld(true) // Raycaster reads the world matrix
scene.add(floor, new THREE.GridHelper(12, 12))

// Ray: origin o and unit direction dir, points are o + t * dir
const o = new THREE.Vector3(2, 5, 1)
const dir = new THREE.Vector3(0.3, -1, 0.1).normalize()

// Substitute into n . (o + t*dir) = d  =>  t = (d - n.o) / (n.dir)
const t = (d - n.dot(o)) / n.dot(dir)
const hit = o.clone().addScaledVector(dir, t)

scene.add(new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([o, hit]),
  new THREE.LineBasicMaterial({ color: 0xff4422 }) // lines need a line material
))
const marker = new THREE.Mesh(
  new THREE.SphereGeometry(0.18),
  new THREE.MeshBasicMaterial({ color: 0xffd700 })
)
marker.position.copy(hit)
scene.add(marker)

// Check the formula against three.js
const found = new THREE.Raycaster(o, dir).intersectObject(floor)[0]
console.log('Formula   ', hit.toArray().map((x) => x.toFixed(3)))
console.log('Raycaster ', found.point.toArray().map((x) => x.toFixed(3)))

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()
