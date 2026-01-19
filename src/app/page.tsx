import { getBrandConfig } from "@/lib/brand-config";
import { Hero } from "@/components/homepage/hero";
import PopularActivities from "@/components/homepage/PopularActivities";

export default function Home() {
  const config = getBrandConfig();
  const { home } = config.content;

  return (
    <div className=" ">

      <Hero />

      <PopularActivities />

      <Hero />

    </div>
  );
}
