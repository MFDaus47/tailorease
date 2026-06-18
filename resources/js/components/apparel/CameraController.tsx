import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

interface Props {

    view: "front" | "back";

}

export default function CameraController({ view }: Props) {

    const { camera } = useThree();

    const controlsRef = useRef<any>(null);

    useEffect(() => {

        if (!controlsRef.current) {
            return
        }

        if (view === "front") {
            camera.position.set(0, 0, 5);
        } else {
            camera.position.set(0, 0, -5);
        }

        controlsRef.current.target.set(0, 0, 0);

        controlsRef.current.update();

    }, [view, camera]);

    return (

        <OrbitControls
            ref={controlsRef}
            enableDamping
        />
    );

}

