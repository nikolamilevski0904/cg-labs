import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100)
camera.position.set(3, 2, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
directionalLight.position.set(5, 8, 4)
scene.add(new THREE.AmbientLight(0xffffff, 0.4), directionalLight)

// Octahedron: 6 vertices (x, y, z each)
const positions = new Float32Array([
  0, 1.5, 0, // 0 top
  0, -1.5, 0, // 1 bottom
  1, 0, 0, // 2 +x
  0, 0, 1, // 3 +z
  -1, 0, 0, // 4 -x
  0, 0, -1, // 5 -z
])

// 8 triangles, each listed counter-clockwise when seen from outside (front face)
const index = [
  0, 3, 2, 0, 4, 3, 0, 5, 4, 0, 2, 5, // top half
  1, 2, 3, 1, 3, 4, 1, 4, 5, 1, 5, 2, // bottom half
]

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setIndex(index)
geometry.computeVertexNormals() // averaged per shared vertex, so shading is smooth

// toNonIndexed copies the vertex of every triangle corner (8 * 3 = 24); normals are then per face
const nonIndexed = geometry.toNonIndexed()
nonIndexed.computeVertexNormals()

// FrontSide (default): faces with the wrong winding would be invisible
const mesh = new THREE.Mesh(
  geometry,
  new THREE.MeshStandardMaterial({ color: 0x66aaff, roughness: 0.4 })
)
scene.add(mesh)

console.log('Indexed:     vertices', geometry.attributes.position.count, 'faces', geometry.index.count / 3)
console.log('Non-indexed: vertices', nonIndexed.attributes.position.count, 'faces', nonIndexed.attributes.position.count / 3)

// F toggles between the two geometries
addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'f') {
    mesh.geometry = mesh.geometry === geometry ? nonIndexed : geometry
  }
})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  mesh.rotation.y += 0.005
  renderer.render(scene, camera)
}
animate()
