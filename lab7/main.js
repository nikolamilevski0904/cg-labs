import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

const PICKABLE = 1 // layer index: only meshes on it can be hit by the raycaster
const HOVER_COLOR = 0x225588
const SELECT_COLOR = 0xaa5500

// All interaction state in one object
const app = { hovered: null, selected: null, dragged: null, pickables: [] }

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0f1419)
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100)
camera.position.set(6, 6, 9)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)
const canvas = renderer.domElement

scene.add(new THREE.GridHelper(20, 20), new THREE.AmbientLight(0xffffff, 0.6))
const sun = new THREE.DirectionalLight(0xffffff, 2)
sun.position.set(5, 10, 7)
scene.add(sun)

// Five pickable meshes, each with its own material; y = half height so they sit on the floor
const shapes = [
  ['Box', new THREE.BoxGeometry(1, 1, 1), [-4, 0.5, -2]],
  ['Sphere', new THREE.SphereGeometry(0.7, 32, 16), [-2, 0.7, 2]],
  ['Cone', new THREE.ConeGeometry(0.6, 1.4, 32), [0, 0.7, -1]],
  ['Cylinder', new THREE.CylinderGeometry(0.5, 0.5, 1.6, 32), [2, 0.8, 2]],
  ['Torus', new THREE.TorusGeometry(0.6, 0.25, 16, 48), [4, 0.85, -2]],
]
const initialPositions = [] // copies used by "Reset positions"
shapes.forEach(([name, geometry, pos], i) => {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 5, 0.6, 0.55) }))
  mesh.name = name
  mesh.position.set(...pos)
  mesh.layers.enable(PICKABLE) // layer 0 stays on, so it is still rendered
  scene.add(mesh)
  app.pickables.push(mesh)
  initialPositions.push(mesh.position.clone())
})

const raycaster = new THREE.Raycaster()
raycaster.layers.set(PICKABLE) // floor and grid are on layer 0 only, so never hit
const pointerNDC = new THREE.Vector2()
const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // plane y = 0
const hitPoint = new THREE.Vector3()
const grabOffset = new THREE.Vector3()
const label = document.getElementById('label')
const settings = { hover: true }

// Pointer pixels -> normalized device coordinates (-1..1, y up), using the CSS size of the canvas
function updatePointer(event) {
  const rect = canvas.getBoundingClientRect()
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  pointerNDC.x = (2 * px) / rect.width - 1
  pointerNDC.y = 1 - (2 * py) / rect.height
}

// Closest pickable under the pointer, or null
function pickAt(event) {
  updatePointer(event)
  raycaster.setFromCamera(pointerNDC, camera)
  const hits = raycaster.intersectObjects(scene.children, true)
  return hits.length ? hits[0] : null
}

// Ray-plane intersection: t = (d - n.o) / (n.d); null when parallel or pointing away
function pointOnFloor(event) {
  updatePointer(event)
  raycaster.setFromCamera(pointerNDC, camera)
  return raycaster.ray.intersectPlane(floor, hitPoint)
}

// Selection colour wins over hover colour
function refreshHighlight() {
  for (const mesh of app.pickables) {
    const color = mesh === app.selected ? SELECT_COLOR : mesh === app.hovered && settings.hover ? HOVER_COLOR : 0x000000
    mesh.material.emissive.setHex(color)
  }
}

// Registered BEFORE OrbitControls so controls.enabled = false is set before its own pointerdown runs
canvas.addEventListener('pointerdown', (event) => {
  const hit = pickAt(event)
  if (hit) console.log(hit.object.name, hit.distance, hit.point)
  app.selected = hit ? hit.object : null
  if (hit && pointOnFloor(event)) {
    app.dragged = hit.object
    grabOffset.copy(hit.object.position).sub(hitPoint) // keeps the grab point under the cursor
    controls.enabled = false // otherwise the camera would orbit while dragging
    canvas.setPointerCapture(event.pointerId) // pointerup outside the canvas still arrives
  }
  refreshHighlight()
})

canvas.addEventListener('pointermove', (event) => {
  if (app.dragged) {
    if (pointOnFloor(event)) {
      app.dragged.position.x = hitPoint.x + grabOffset.x // only x and z, y is kept
      app.dragged.position.z = hitPoint.z + grabOffset.z
    }
    return
  }
  const hit = settings.hover ? pickAt(event) : null
  app.hovered = hit ? hit.object : null
  canvas.style.cursor = app.hovered ? 'pointer' : 'default'
  refreshHighlight()
})

canvas.addEventListener('pointerup', (event) => {
  if (!app.dragged) return
  canvas.releasePointerCapture(event.pointerId)
  app.dragged = null
  controls.enabled = true
})

const controls = new OrbitControls(camera, canvas)

const gui = new GUI()
gui.add(settings, 'hover').name('Hover highlight').onChange(() => {
  app.hovered = null
  canvas.style.cursor = 'default'
  refreshHighlight()
})
gui.add({ reset: () => app.pickables.forEach((m, i) => m.position.copy(initialPositions[i])) }, 'reset').name('Reset positions')

// Place the HTML label over the selected object: world -> NDC -> canvas pixels
function updateLabel() {
  if (!app.selected) { label.style.display = 'none'; return }
  const ndc = app.selected.position.clone().project(camera)
  const rect = canvas.getBoundingClientRect()
  label.textContent = app.selected.name
  label.style.display = ndc.z < 1 ? 'block' : 'none' // hide when behind the camera
  label.style.left = `${rect.left + ((ndc.x + 1) / 2) * rect.width}px`
  label.style.top = `${rect.top + ((1 - ndc.y) / 2) * rect.height}px`
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

renderer.setAnimationLoop(() => {
  controls.update()
  updateLabel()
  renderer.render(scene, camera)
})
