export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="w-100 real-100vh w-full max-w-full">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-wrap content-end text-4xl px-4 pt-8 text-color-main">
                tube uni
            </div>

            <div className="flex flex-col gap-4">
              {children}
            </div>
          </div>
      </div>
  );
}