"use client"
import { getBrandConfig } from "@/lib/brand-config";
 
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
export function Hero() {
    const config = getBrandConfig();
    const { home } = config.content;

    return (
        <section className="container mx-auto py-16">
            <div className="space-y-4 flex flex-col items-center text-center ">
                <div className="bg-primary-1 rounded-full px-5 py-1 w-max ">
                    <div className="  ">
                      {home.heroTag}
                    </div>
                </div>

                <h1 className="text-5xl font-semibold tracking-tighter leading-none text-primary mt-10 ">
                    {home.heroTitle}
                </h1>

                <p className="text-primary font-light text-xl md:text-xl opacity-90   ">
                    {home.heroSubtitle}
                </p>
            </div>


            <div className="mt-12 max-w-lg mx-auto">
                <InputGroup className="bg-secondary-2 p-2 rounded-[10px] border-accent  opacity-70 text-primary">
                    <InputGroupInput placeholder="Type to search..." />
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton  className="text-primary" >Search</InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>




            <div className="w-full h-px mt-20 opacity-20 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </section>
    );
}
