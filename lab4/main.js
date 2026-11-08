import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xFFFFFF)

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(4, 5, 9) // on +z side, so -x is on the left of the screen
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
)
ground.rotation.x = -Math.PI / 2
scene.add(ground, new THREE.GridHelper(20, 20))

const directional = new THREE.DirectionalLight(0xFFFFFF, 2)
directional.position.set(5, 10, 7)
scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5), directional)

// Hierarchy: base > shoulder > elbow > wrist > palm > finger joints.
// Each joint is a Group at the end of its parent, so rotating it moves everything below it.
const darkMat = new THREE.MeshStandardMaterial({ color: 0x555555 })
const armMat = new THREE.MeshStandardMaterial({ color: 0x3399ff })

const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32), darkMat)
scene.add(base)

const shoulder = new THREE.Group()
shoulder.position.y = 0.5
base.add(shoulder)
shoulder.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), darkMat))
const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3, 0.7), armMat)
upperArm.position.y = 1.2
shoulder.add(upperArm)

const elbow = new THREE.Group()
elbow.position.y = 2.6
shoulder.add(elbow)
elbow.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), darkMat))
const foreArm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3, 0.6), armMat)
foreArm.position.y = 1.25
elbow.add(foreArm)

const wrist = new THREE.Group()
wrist.position.y = 2.8
elbow.add(wrist)
wrist.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), darkMat))
const palm = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xffaa55 })
)
palm.position.y = 1
wrist.add(palm)

shoulder.rotation.z = THREE.MathUtils.degToRad(-20)
elbow.rotation.z = THREE.MathUtils.degToRad(40)
wrist.rotation.z = THREE.MathUtils.degToRad(-20)

const fingerMat = new THREE.MeshStandardMaterial({ color: 0xffcc88 })
const jointMat = new THREE.MeshStandardMaterial({ color: 0xcc7733 })

// Chain of phalanges: each joint Group sits at the end of the previous phalanx.
// Returns the joints so they can be bent later.
function buildFinger(parent, lengths, width) {
  const joints = []
  let previous = 0 // length of the phalanx below, so the next joint starts at its end
  for (const length of lengths) {
    const joint = new THREE.Group()
    joint.position.y = previous
    parent.add(joint)
    joint.add(new THREE.Mesh(new THREE.SphereGeometry(width * 0.65, 16, 12), jointMat))
    const bone = new THREE.Mesh(new THREE.BoxGeometry(width, length, width), fingerMat)
    bone.position.y = length / 2 // box is centred, so lift it so it starts at the joint
    joint.add(bone)
    joints.push(joint)
    parent = joint
    previous = length
  }
  return joints
}

// Four fingers along the top edge of the palm (palm top is y = 0.75), thumb side first.
// Different phalanx lengths: index, middle, ring, little
const fingerLengths = [[0.6, 0.4, 0.3], [0.7, 0.5, 0.35], [0.65, 0.45, 0.3], [0.5, 0.35, 0.25]]
const fingers = fingerLengths.map((lengths, i) => {
  const root = new THREE.Group()
  root.position.set(-0.675 + i * 0.45, 0.75, 0)
  palm.add(root)
  return buildFinger(root, lengths, 0.28)
})

// Thumb: 2 segments on the left side of the palm (-x), tilted outward (+z rotation leans toward -x)
const thumbRoot = new THREE.Group()
thumbRoot.position.set(-0.9, -0.2, 0)
thumbRoot.rotation.z = THREE.MathUtils.degToRad(55)
palm.add(thumbRoot)
const thumb = buildFinger(thumbRoot, [0.6, 0.45], 0.32)

// Curl 0..1 bends every joint of a finger around x by its own maximum angle
const maxBend = [80, 90, 70].map(THREE.MathUtils.degToRad)
const curl = { fingers: 0, thumb: 0 }
function applyCurl(joints, amount) {
  joints.forEach((joint, i) => { joint.rotation.x = amount * maxBend[i] })
}

const step = THREE.MathUtils.degToRad(5)
window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (key === 'q') shoulder.rotation.z += step
  if (key === 'a') shoulder.rotation.z -= step
  if (key === 'w') elbow.rotation.z += step
  if (key === 's') elbow.rotation.z -= step
  if (key === 'e') wrist.rotation.z += step
  if (key === 'd') wrist.rotation.z -= step
  if (key === 'r') curl.fingers = Math.min(1, curl.fingers + 0.1)
  if (key === 'f') curl.fingers = Math.max(0, curl.fingers - 0.1)
  if (key === 't') curl.thumb = Math.min(1, curl.thumb + 0.1)
  if (key === 'g') curl.thumb = Math.max(0, curl.thumb - 0.1)
  fingers.forEach((joints) => applyCurl(joints, curl.fingers))
  applyCurl(thumb, curl.thumb)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 3.5, 0) // look at the middle of the arm and hand, not the floor
controls.enableDamping = true // smooth camera motion, needs update() every frame

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()
