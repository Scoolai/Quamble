import React from "react";

export default function Banner() {
  return (
    <section className="relative w-full h-[24vh] sm:h-[70vh] lg:h-[92vh] overflow-hidden">
      <img
        src="/assets/Banner2.png"
        alt="Banner"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </section>
  );
}
