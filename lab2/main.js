import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'three/addons/libs/lil-gui.module.min.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0f1419)

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100)
camera.position.set(5, 5, 9) // far enough to see long vectors

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)
scene.add(new THREE.AxesHelper(3)) // red x, green y, blue z

const controls = new OrbitControls(camera, renderer.domElement)

// Vectors a, b and their sum, all drawn from the origin
const origin = new THREE.Vector3()
const a = new THREE.Vector3(3, 4, 0)
const b = new THREE.Vector3(1, 0, 0)
const sum = new THREE.Vector3()

// Arrow(direction, origin, length, color, headLength, headWidth); real values set in updateVectors
const arrA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0xE8431C, 0.35, 0.2)
const arrB = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0x1E40FF, 0.35, 0.2)
const arrSum = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0x3ecf8e, 0.35, 0.2)
scene.add(arrA, arrB, arrSum)

// Point an arrow along v with the length of v
function setArrow(arrow, v) {
  arrow.setDirection(v.clone().normalize())
  arrow.setLength(v.length(), 0.35, 0.2)
}

// Read-only result fields shown in the GUI
const results = { sum: '', dot: '', cross: '', angle: '' }

const gui = new GUI()
for (const [name, v] of [['Vector A', a], ['Vector B', b]]) {
  const folder = gui.addFolder(name)
  for (const axis of ['x', 'y', 'z']) {
    folder.add(v, axis, -5, 5, 0.1) // slider edits the vector directly
  }
  folder.open()
}
const resultsFolder = gui.addFolder('Results')
resultsFolder.add(results, 'sum').name('a + b').disable()
resultsFolder.add(results, 'dot').name('a . b').disable()
resultsFolder.add(results, 'cross').name('a x b').disable()
resultsFolder.add(results, 'angle').name('angle').disable()
resultsFolder.open()

const fmt = (v) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`

// Recompute everything from a and b; called once per frame from the single loop
function updateVectors() {
  setArrow(arrA, a)
  setArrow(arrB, b)
  sum.addVectors(a, b)
  setArrow(arrSum, sum)

  const dot = a.dot(b)
  // cos(theta) = a.b / (|a||b|); clamp guards acos against rounding past +-1
  const cos = THREE.MathUtils.clamp(dot / (a.length() * b.length()), -1, 1)
  results.sum = fmt(sum)
  results.dot = dot.toFixed(2)
  results.cross = fmt(new THREE.Vector3().crossVectors(a, b))
  results.angle = THREE.MathUtils.radToDeg(Math.acos(cos)).toFixed(2) + ' deg'
  resultsFolder.controllersRecursive().forEach((c) => c.updateDisplay())
}

// One loop only: GUI changes are picked up on the next frame
function animate() {
  requestAnimationFrame(animate)
  updateVectors()
  controls.update()
  renderer.render(scene, camera)
}
animate()
