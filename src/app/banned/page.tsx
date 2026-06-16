export default function BannedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="glass-strong max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-bold">Account suspended</h1>
        <p className="mt-3 text-muted-foreground">
          Your GreenSteps account has been suspended. If you believe this is a mistake, please contact support.
        </p>
      </div>
    </main>
  );
}
