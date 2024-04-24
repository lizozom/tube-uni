"use client";

import Image from "next/image";

export interface SplashScreenProps {
}

export function SplashScreen(props: SplashScreenProps) {
  
  return (
    <div className="flex h-screen">
        <div className="flex m-auto flex-col items-center gap-4 ">
        <Image
                src="/images/logo.png"
                width={250}
                height={250}
                className="-my-8"
                alt="logo"
              />
              <span className="logo-text text-5xl">tube uni</span>
              <span className="text-2xl text-center">do something useful with<br/>your commute, dummy</span>
        </div>
    </div>

  );
}
