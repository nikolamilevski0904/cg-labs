import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

// 75 deg vertical FOV, window aspect, near 0.1, far 1000
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(0, 1, 5)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

// Mesh = geometry (shape) + material (surface)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0xE8431C })
)
scene.add(cube)

// Standard material needs light: ambient fills shadows, directional gives shading
scene.add(new THREE.AmbientLight(0xFFFFFF, 1))
const dirLight = new THREE.DirectionalLight(0xFFFFFF, 2.5)
dirLight.position.set(3, 5, 4)
scene.add(dirLight)

const controls = new OrbitControls(camera, renderer.domElement)

function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.005 // radians per frame
  cube.rotation.y += 0.005
  controls.update()
  renderer.render(scene, camera)
}
animate()
