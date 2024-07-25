"use client";

import { Button } from "@nextui-org/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { track } from '@vercel/analytics';
import { useRouter } from 'next/navigation'

export interface SplashScreenProps {}

export function SplashScreen() {

  const router = useRouter();
  const [display, setDisplay] = useState<boolean>(false);

  useEffect(() => {
    setDisplay(true);
  }, []);

  const onClick = () => {
    track('splashScreenClick');
    router.push('/app');
  }
  
  if (!display) {
    return null;
  } 
  return (
    <div className="flex real-100vh relative">
        <div className="flex m-auto flex-col items-center gap-4 pb-16">
        <Image
                src="/images/logo.svg"
                width={250}
                height={250}
                className="-my-8"
                alt="logo"
              />
              <span className="logo-text text-5xl">tube uni</span>
              <span className="text-2xl text-center">do something useful with<br/>your commute, dummy</span>
              <div className=" absolute bottom-[35px] left-[50%] -translate-x-[50%]">
                  <Button className="mt-4 rounded-none create-button text-main" onClick={onClick}>
                  yes please           
                  </Button>
              </div>
        </div>
    </div>

  );
}
