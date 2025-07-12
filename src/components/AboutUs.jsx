import React from "react";
import Team from './Team'

const AboutUs = () => {
    return (
     <>
        <div className="2xl:container 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="w-full lg:w-5/12 flex flex-col justify-center">
                    <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">About Us</h1>
                    <p className="font-normal text-base leading-6 text-gray-600 ">Welcome to our interactive quiz platform, a place where quiz enthusiasts meet their match! Our mission is to create a seamless and engaging space for quiz lovers to explore their favorite themes and challenge their knowledge. We aim to bridge the gap between quiz players and quiz masters, fostering a vibrant community of curious minds. Whether you're here to test your skills or create thrilling quizzes, our platform is designed to make your experience enjoyable and rewarding. Join us in redefining the quiz game experience!</p>
                </div>
                <div className="w-full lg:w-8/12 ">
                    <img className="w-full h-full" src="https://i.ibb.co/FhgPJt8/Rectangle-116.png" alt="A group of People" />
                </div>
            </div>
        </div>

        <Team />
     </>
    );
};

export default AboutUs;
