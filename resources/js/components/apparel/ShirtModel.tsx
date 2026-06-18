import { Center, useGLTF, useTexture } from "@react-three/drei";
import { useLoader } from  "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";

interface Props {
    color: string;
    rotation:  number;
    designUrl:  string | null;
}

export default function ShirtModel({ color, rotation, designUrl }: Props) {

    const EMPTY_TEXTURE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+Xc5kAAAAASUVORK5CYII=";

    const texture = useLoader(
        THREE.TextureLoader,
        designUrl ||  EMPTY_TEXTURE
    );

    const hasDesign = !!designUrl;
    const { scene } = useGLTF("/models/mens_t_shirt.glb");

    useEffect(() => {
        scene.traverse((child: any) => {

            if (child.isMesh) {
                child.material.roughness = 0.85;
                child.material.metalness = 0.1;
                child.material.color = new THREE.Color(color);

                if (hasDesign) {
                    texture.flipY = true;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    child.material.map = texture;
                } else  {
                    child.material.map = null;
                }

                child.material.needsUpdate = true;
            }
        });

    }, [scene, color, texture, hasDesign]);



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
