"use client";

import Image from "next/image";

export interface ErrorScreenProps {
  onBack: () => void;
  errorOrCode?: Error | undefined;
}

export function ErrorScreen(props: ErrorScreenProps) {
  const { onBack, errorOrCode } = props;

  let errMsg = (
    <>
      <span className="text-2xl text-center items-center">it's not you, it's us but<br/>somthing went wrong.</span>
      <span className="text-2xl text-center items-center">we're sorry</span>
    </>
  );

  if (errorOrCode?.message === "400") {
    errMsg = (
      <>
        <span className="text-2xl text-center items-center">this type of content is not supported.</span>
        <span className="text-2xl text-center items-center">please try again</span>
      </>
    )
  }

  
  return (
    <div className="flex real-100vh relative">
        <div className="flex m-auto flex-col items-center gap-8 ">
            <Image
                src="/images/Error.svg"
                width={150}
                height={150}
                alt="error"
              />

              {errMsg}
        </div>
        <button className="text-main absolute bottom-[35px] left-[50%] -translate-x-[50%]" onClick={onBack}>
          back to start
        </button>
    </div>

  );
}
