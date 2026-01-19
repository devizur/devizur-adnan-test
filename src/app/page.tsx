import { getBrandConfig } from "@/lib/brand-config";
import { Hero } from "@/components/homepage/hero";

export default function Home() {
  const config = getBrandConfig();
  const { home } = config.content;

  return (
    <div className=" ">
 
      <Hero />
 
      <Hero />
 
      <Hero />
 
    </div>
  );
}
