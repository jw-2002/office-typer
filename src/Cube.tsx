import { useRef, useState } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import type { Mesh } from 'three'

export default function Cube(props: ThreeElements['mesh']) {
  const ref = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Runs every frame; delta is seconds since the last frame.
  useFrame((_, delta) => {
    ref.current.rotation.y += delta
  })

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
