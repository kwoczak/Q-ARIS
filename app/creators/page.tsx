import type { Metadata } from "next";
import { CreatorsView } from "./CreatorsView";

export const metadata: Metadata = {
  title: "Q-ARIS for YouTube Creators | Interactive Second-Screen Experiences",
  description: "Turn YouTube videos into interactive second-screen experiences with QR-powered quizzes, bonus content, maps, 3D models and sponsor activations.",
  openGraph: {
    title: "Make Your YouTube Videos Interactive",
    description: "Let viewers scan, explore and interact on their phones while your video continues playing on TV.",
    type: "website",
  },
};

export default function CreatorsPage() {
  return <CreatorsView />;
}
