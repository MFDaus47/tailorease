import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import CameraController from "./CameraController";
import ShirtModel from "./ShirtModel";

interface Props {
    color: string;
}

export default function ShirtViewer({ color }: Props) {
    const [rotation, setRotation] = useState(0);
    const [view, setView]  = useState<"front" | "back">("front");

    return (
        <div className="w-full relative bg-slate-50/50 rounded-lg mt-4 border">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={() => setView("front")}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    Front
                </button>
                <button
                    onClick={() => setView("back")}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    Back
                </button>
            </div>

            <div className="w-full h-[500px]">
                <Canvas camera={{ position: [0, 0, 5.5], fov: 20 }}>
                    <ambientLight intensity={1.5}/>

                    <directionalLight
                        position={[2, 5, 2]}
                        intensity={2}
                    />

                    <ShirtModel color={color} rotation={rotation} />

                    <Environment preset="city" />

                    <OrbitControls/>

                    <CameraController view={view} />

                </Canvas>
            </div>

        </div>
    )
}
