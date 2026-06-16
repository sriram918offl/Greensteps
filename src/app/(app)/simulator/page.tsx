import { TopBar } from "@/components/dashboard/top-bar";
import { SimulatorUI } from "./simulator-ui";

export default function SimulatorPage() {
  return (
    <>
      <TopBar title="Carbon Scenario Simulator" />
      <main className="p-4 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">What if?</h2>
            <p className="mt-2 text-muted-foreground">
              Ask hypothetical questions — see the projected CO₂ savings, money saved, and time to impact.
            </p>
          </div>
          <SimulatorUI />
        </div>
      </main>
    </>
  );
}
