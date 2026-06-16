import { TopBar } from "@/components/dashboard/top-bar";
import { CalculatorWizard } from "./calculator-wizard";

export default function CalculatorPage() {
  return (
    <>
      <TopBar title="Carbon Calculator" />
      <main className="p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Estimate your monthly footprint</h2>
            <p className="mt-2 text-muted-foreground">
              Answer a few questions about your lifestyle. Takes ~3 minutes.
            </p>
          </div>
          <CalculatorWizard />
        </div>
      </main>
    </>
  );
}
