"use client";

export interface LoadingScreenProps {
}

export function LoadingScreen(props: LoadingScreenProps) {
  
  return (
    <div className="flex h-screen">
        <div className="flex my-[50%] flex-col gap-8 w-full">
            <span className="text-2xl text-center items-center">working on making<br/>you less stupid...</span>
            <div className="dropdown-button h-16  animate-width"></div>
        </div>
    </div>

  );
}
