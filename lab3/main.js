import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100)
camera.position.set(5, 6, 7)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

// Light sits inside the Sun, so it shines outward on the planets
scene.add(new THREE.PointLight(0xffffff, 400, 0, 1.6), new THREE.AmbientLight(0xffffff, 2.3))

const sphere = (radius, color) => new THREE.Mesh(
  new THREE.SphereGeometry(radius, 32, 24),
  new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
)

const sun = sphere(2, 0xE8431c)
sun.material.emissive.set(0xE8431c) // emissive = glows by itself, the light inside cannot light its outer surface
scene.add(sun)

// Pivot = empty Object3D at the centre of an orbit. Rotating it swings its child around.
// Pivots are siblings of the Sun, so the Sun's own spin does not drag the planets.
const earthPivot = new THREE.Object3D()
scene.add(earthPivot)
const earth = sphere(0.8, 0x1E40FF)
earth.position.x = 6 // orbit radius
earthPivot.add(earth)

// Moon pivot is a child of Earth, so the Moon follows Earth and orbits it
const moonPivot = new THREE.Object3D()
earth.add(moonPivot)
const moon = sphere(0.25, 0x555555)
moon.position.x = 1.8
moonPivot.add(moon)

const marsPivot = new THREE.Object3D()
scene.add(marsPivot)
const mars = sphere(0.8, 0xbb3e04)
mars.position.x = 10
marsPivot.add(mars)

const phobosPivot = new THREE.Object3D()
mars.add(phobosPivot)
const phobos = sphere(0.25, 0x134661)
phobos.position.x = 1.8
phobosPivot.add(phobos)

const controls = new OrbitControls(camera, renderer.domElement)

function animate() {
  requestAnimationFrame(animate)
  sun.rotation.y += 0.003 // self-rotation of each body
  earth.rotation.y += 0.05
  mars.rotation.y += 0.03
  earthPivot.rotation.y += 0.01 // orbits, different speeds
  moonPivot.rotation.y += 0.04
  marsPivot.rotation.y += 0.006
  phobosPivot.rotation.y += 0.06
  controls.update()
  renderer.render(scene, camera)
}
animate()

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix() // apply the new aspect
  renderer.setSize(innerWidth, innerHeight)
})
