import React from 'react';
import '../styles/ScoreCard.css'; // Make sure to create this CSS file with the styles below

const ScoreCard = () => {
    const cardData = [
        {
            title: 'Weekly Top 5',
            details: [
                { name: 'Alice', score: 1200 },
                { name: 'Bob', score: 1150 },
                { name: 'Charlie', score: 1100 },
                { name: 'David', score: 1050 },
                { name: 'Eve', score: 1000 }
            ]
        },
        {
            title: 'Monthly Top 5',
            details: [
                { name: 'Frank', score: 4500 },
                { name: 'Grace', score: 4400 },
                { name: 'Hank', score: 4300 },
                { name: 'Ivy', score: 4200 },
                { name: 'Jack', score: 4100 }
            ]
        },
        {
            title: 'All Time Top 5',
            details: [
                { name: 'Kim', score: 10000 },
                { name: 'Liam', score: 9800 },
                { name: 'Mia', score: 9700 },
                { name: 'Noah', score: 9600 },
                { name: 'Olivia', score: 9500 }
            ]
        }
    ];

    return (
        <div className="card-wrapper flex-col pt-5 ">
          <h1 className='bg-gradient-to-b from-[#ecc4e9] to-[#ecc4e9] text-[#9902c7] text-4xl font-normal text-center p-2 pb-3 rounded-xl bg-slate-300 shadow-[inset_0px_0px_10px_0px_#1a202c]' >Leader Board</h1>
          <div className='flex gap-5'>
            {cardData.map((card, index) => (
                <div 
                    key={index} 
                    className="card-container"
                >
                    <div className="card">
                        <div className="card-face card-front font-medium bg-[url('/assets/LBCardBG.jpg')] bg-cover bg-center shadow-[inset_0px_0px_10px_0px_#1a202c]">
                            {card.title}
                        </div>
                        <div className="card-face card-back bg-gradient-to-b from-[#00c6fb] to-[#005bea] shadow-[inset_0px_0px_10px_0px_#1a202c]">
                          <h1 className='text-2xl'> {card.title} </h1>
                            <ul className='w-full h-full flex flex-col justify-center gap-2 px-6'>
                                {card.details.map((player, i) => (
                                    <li key={i}>{player.name}: {player.score}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
    );
};

export default ScoreCard;