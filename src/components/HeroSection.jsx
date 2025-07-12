import React from "react";
import LeaderBoard from "./LeaderBoard";
import Banner from "./Banner";
import SlickCarouse from "../ui_components/SlickCarousel"

export default function HeroSection() {
  return (
    <>
      <Banner />
      <div className="py-1 lg:py-12 sm:py-5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mt-10 flow-root sm:mt-20">
            <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                <LeaderBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlickCarouse />
    </>
  );
}
