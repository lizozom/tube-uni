"use client";

import Image from "next/image";

export interface ErrorScreenProps {
  onBack: () => void;
}

export function ErrorScreen(props: ErrorScreenProps) {
  const { onBack } = props;
  
  return (
    <div className="flex real-100vh relative">
        <div className="flex m-auto flex-col items-center gap-8 ">
            <Image
                src="/images/Error.svg"
                width={150}
                height={150}
                alt="error"
              />
            <span className="text-2xl text-center items-center">it's not you, it's us but<br/>somthing went wrong.</span>
            <span className="text-2xl text-center items-center">we're sorry</span>
        </div>
        <button className="text-main absolute bottom-[35px] left-[50%] -translate-x-[50%]" onClick={onBack}>
          back to start
        </button>
    </div>

  );
}
