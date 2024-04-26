
import { stations } from './api/stations';
import { CommuteApp } from "./components/CommuteApp";

const topics = [
  'the history of toothbrushes',
  'how frogs make love',
  'how coffee came to europe',
  'what is a unicorn',
  'why flowers bloom in spring',
  'where do squirrels sleep',
  'the way to make silicone',
]


export default function Home() {  
  const placeholderTopic = topics[Math.floor(Math.random() * topics.length)];
  
  return (
    <main className="flex min-h-screen h-full w-full max-w-full flex-col items-left justify-between pt-4">
      <CommuteApp stations={stations} topics={topics} placeholderTopic={placeholderTopic}/>
    </main>
  );
}
