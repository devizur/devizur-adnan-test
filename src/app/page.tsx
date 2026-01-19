import { getBrandConfig } from "@/lib/brand-config";
import { Hero } from "@/components/homepage/hero";
import PopularActivities from "@/components/homepage/PopularActivities";
import PopularFoods from "@/components/homepage/PopularFoods";
import PopularPackage from "@/components/homepage/PopularPackage";

export default function Home() {
  const config = getBrandConfig();
  const { home } = config.content;

  return (
    <div className=" ">

      <Hero />
      <PopularFoods />
      <PopularPackage />
 
    </div>
  );
}
