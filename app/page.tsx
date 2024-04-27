
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
  'why are some people left handed',
  'what are the biggest creatures in the ocean',
  'where did people poo in ancient times',
  'why some european countries still have monarchs',
  'the paint of the golden gate bridge',
  'the history of the london tube',
  'how mcdonald\'s works',
  'who invented peanut butter',
  'star ratings of hotels',
  'color blind animals',
  'the story of fabergé eggs'
]


export default function Home() {  
  const placeholderTopic = topics[Math.floor(Math.random() * topics.length)];
  
  return (
    <main className="flex real-100vh w-full max-w-full flex-col items-left justify-between">
      <CommuteApp stations={stations} topics={topics} placeholderTopic={placeholderTopic}/>
    </main>
  );
}
