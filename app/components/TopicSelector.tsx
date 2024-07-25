import React, { useState } from 'react';
import TopicCard from './TopicCard';

interface TopicSelector {
  content: string;
}

interface TopicSelectorProps {
    onSelect: (topics: string[]) => void;
}

const initialTopics: TopicSelector[] = [
  { content: 'history' },
  { content: 'art' },
  { content: 'psychology' },
  { content: 'ancient cultures' },
  { content: 'animals' },
  { content: 'crazy inventors' },
  { content: 'food' },
  { content: 'movies' },
  { content: 'how stuff works' },
  { content: 'fashion' },
  { content: 'space' },
  { content: 'music' },
  { content: 'science' },
  { content: 'female leaders' },
  { content: 'architecture' },
  { content: 'geology' },
  { content: 'internet' },
  { content: 'finance' },
  { content: 'cryptocurrencies' },
];

const TopicSelector: React.FC<TopicSelectorProps> = (props: TopicSelectorProps) => {
  const { onSelect } = props;
  const [clickedStates, setClickedStates] = useState<boolean[]>(new Array(initialTopics.length).fill(false));
  const [clickedTopics, setClickedTopics] = useState<string[]>([]);

  const handleCardClick = (index: number) => {
    const newClickedStates = [...clickedStates];
    newClickedStates[index] = !newClickedStates[index];
    setClickedStates(newClickedStates);

    const topic = initialTopics[index].content;
    const newClickedTopics = newClickedStates[index]
      ? [...clickedTopics, topic]
      : clickedTopics.filter(t => t !== topic);
    setClickedTopics(newClickedTopics);

    onSelect(newClickedTopics);
    
  };

  return (
    <div className="flex flex-wrap justify-center p-4">
      {initialTopics.map((card, index) => (
        <TopicCard
          key={index}
          content={card.content}
          isClicked={clickedStates[index]}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </div>
  );
};

export default TopicSelector;
