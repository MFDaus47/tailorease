import { Center, useGLTF  } from "@react-three/drei";

interface Props {
    color: string;
    rotation:  number;
}

export default function ShirtModel({ color, rotation }: Props) {
    const { scene } = useGLTF("/models/mens_t_shirt.glb");


    scene.traverse((child: any) => {
        if (child.isMesh) {
            child.material.color.set(color);
        }
    });

    return  (
        <Center>
            <primitive
                object={scene}
                rotation={[0, rotation, 0]}
                scale={2}
            />;
        </Center>
    )
}
