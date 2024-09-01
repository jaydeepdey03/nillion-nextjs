import Image from "next/image";
import {Inter} from "next/font/google";
import {useRouter} from "next/router";
import {Button} from "@/components/ui/button";

const inter = Inter({subsets: ["latin"]});

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full bg-white">
      <div>
        <Button onClick={() => router.push("/compute")}>Compute</Button>
      </div>
    </div>
  );
}
