import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import modelUrl from './public/model.glb?url' // Vite resolves the path in dev and build

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100)
camera.position.set(3, 2, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
directionalLight.position.set(5, 8, 4)
scene.add(new THREE.AmbientLight(0xffffff, 0.4), directionalLight)

new GLTFLoader().load(modelUrl, (gltf) => {
  gltf.scene.rotation.y = Math.PI // turn the model to face the camera
  scene.add(gltf.scene)

  // Count vertices and triangles of every mesh in the file
  let meshCount = 0
  let totalVertices = 0
  let totalFaces = 0
  gltf.scene.traverse((child) => {
    if (!child.isMesh) return
    const geometry = child.geometry
    const vertices = geometry.attributes.position.count
    const faces = (geometry.index ? geometry.index.count : vertices) / 3 // 3 indices per triangle
    meshCount++
    totalVertices += vertices
    totalFaces += faces
    console.log('Mesh', child.name, 'vertices', vertices, 'faces', faces)
  })
  console.log('Total meshes', meshCount, 'vertices', totalVertices, 'faces', totalFaces)
})

const controls = new OrbitControls(camera, renderer.domElement)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()
