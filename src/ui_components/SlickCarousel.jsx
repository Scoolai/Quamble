import React from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

// Cards with images and dynamic quiz themes
const cards = [
  {
    image: "/assets/Cards/Sport.png",
    theme: "Sports",
  },
  {
    image: "/assets/Cards/Cricket.png",
    theme: "cricket",
  },
  {
    image: "/assets/Cards/history.png",
    theme: "history",
  },
  {
    image: "/assets/Cards/Geography1.png",
    theme: "geography",
  },
  {
    image: "/assets/Cards/Sci.png",
    theme: "science",
  },
];

// Custom Arrows
const PrevArrow = ({ onClick }) => (
  <div
    className="absolute lg:left-[-40px] top-1/2 transform -translate-y-1/2 cursor-pointer w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
    onClick={onClick}
  >
    <FaChevronLeft className="text-white w-4 h-4" />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div
    className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 cursor-pointer w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
    onClick={onClick}
  >
    <FaChevronRight className="text-white w-4 h-4" />
  </div>
);

const AutoplayCarousel = () => {
  const navigate = useNavigate();

  const handleCardClick = (theme) => {
    const url = `/quiz/ai-quiz?theme=${theme}&mode=theme-challenge&numQuestions=5`;
    navigate(url);
  };

  const settings = {
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    dots: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="relative max-w-7xl mx-auto py-10 px-4">
      <Slider {...settings}>
        {cards.map((card, index) => (
          <div key={index} className="p-4">
            <div
              onClick={() => handleCardClick(card.theme)}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            >
              <img
                src={card.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AutoplayCarousel;
