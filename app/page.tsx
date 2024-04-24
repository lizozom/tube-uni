
import { stations } from './api/stations';
import { CommuteForm } from "./components/CommuteForm";

export default function Home() {  
  
  return (
    <main className="flex min-h-screen flex-col items-left justify-between pt-4">
      <CommuteForm stations={stations}/>
    </main>
  );
}
