import * as THREE from 'three'
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'
import plyUrl from './models/3D.ply?url' // Vite resolves the path in dev and build

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)

const aspect = innerWidth / innerHeight

const perspective = new THREE.PerspectiveCamera(75, aspect, 0.1, 100)
perspective.position.set(2, 2, 10)
perspective.lookAt(0, 0, 0)

// Orthographic: no perspective shrinking, the visible box is 2*size tall and 2*size*aspect wide
const size = 8
const orthographic = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 0.1, 100)
orthographic.position.set(0, 0, 10)
orthographic.lookAt(0, 0, 0)

const cameras = [perspective, orthographic]
let current = 0
console.log('Active: PerspectiveCamera')

addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
    current = (current + 1) % cameras.length
    console.log('Active:', current === 0 ? 'PerspectiveCamera' : 'OrthographicCamera')
  }
})

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const directional = new THREE.DirectionalLight(0xffffff, 2.5)
directional.position.set(3, 5, 8)
scene.add(new THREE.AmbientLight(0xffffff, 0.35), directional)

const depths = [0, -3, -8] // z position of each model
const colors = [0xdb8787, 0x87b4db, 0x8bdb87]

new PLYLoader().load(plyUrl, (geo) => {
  geo.center() // move the model's centre to its local origin
  for (let i = 0; i < 3; i++) {
    // One shared geometry, a separate material per mesh so each has its own colour
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.5 }))
    mesh.scale.setScalar(0.02) // model is about 250 units tall, shrink to fit the view
    mesh.position.set((i - 1) * 2, 0, depths[i]) // spread in x, push back in z
    scene.add(mesh)
  }
})

addEventListener('resize', () => {
  const aspect = innerWidth / innerHeight
  perspective.aspect = aspect
  orthographic.left = -size * aspect
  orthographic.right = size * aspect
  cameras.forEach((camera) => camera.updateProjectionMatrix()) // apply new aspect / bounds
  renderer.setSize(innerWidth, innerHeight)
})

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, cameras[current])
}
animate()
