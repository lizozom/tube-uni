'use client'

export function LoadingScreen () {
  return (
    <div className="flex h-screen relative">
        <div className="flex my-[50%] flex-col gap-8 w-full">
            <span className="text-2xl text-center items-center">working on making<br/>you less stupid...</span>
            <div className="dropdown-button h-16  animate-width"></div>
            <span className="text-main w-full text-center absolute bottom-[35px] left-[50%] -translate-x-[50%]">
              this can take a minute or two
            </span>
        </div>
    </div>

  )
}
