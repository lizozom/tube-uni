import React from 'react';

interface CardProps {
  content: string;
  isClicked: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ content, isClicked, onClick }) => {
  return (
    <div
      className={`p-2 m-2 text-white text-lg ${isClicked ? 'bg-orange-800' : 'bg-orange-500'} cursor-pointer flex flex-grow justify-center`}
      onClick={onClick}
    >
      {content}
    </div>
  );
};

export default Card;
