export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // return <section>HELLO{children}</section>


  return (
      <div className="w-100 flex real-100vh w-full max-w-full flex-col items-left justify-between">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-wrap content-end text-4xl px-4 pt-8 text-color-main">
                tube uni
            </div>
            {children}
          </div>
      </div>
  );
}