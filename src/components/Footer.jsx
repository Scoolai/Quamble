import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <div className="relative mt-16 bg-[#661fff]">
      <svg
        className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-[#661fff]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 54"
      >
        <path
          fill="currentColor"
          d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
        />
      </svg>

      <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 text-white">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-16 row-gap-10 mb-8 lg:grid-cols-6">
          {/* Logo and description */}
          <div className="md:max-w-md lg:col-span-2">
            <a
              href="/"
              aria-label="Go home"
              title="Company"
              className="inline-flex items-center"
            >
              <img src="/assets/logoD.png" alt="Quamble Logo" className="h-32 w-auto" />
            </a>
            <div className="mt-0 lg:max-w-sm">
              <p className="text-sm text-deep-purple-50">
                Explore your favorite quiz themes and challenge your knowledge on our interactive platform. Bridging the gap between quiz enthusiasts and quiz masters, one question at a time!
              </p>
            </div>
          </div>

          {/* Contact Info Inline */}
          <div className="text-sm text-white lg:max-w-md">
            <h2 className="text-lg font-semibold mb-4">Contact Us</h2>

            <div className="mb-4">
              <p className="font-medium">Email:</p>
              <p className="text-deep-purple-50">info.quamble@gmail.com</p>
            </div>

            <div className="mb-4">
              <p className="font-medium">Address:</p>
              <p className="text-deep-purple-50">
                G-08, Design Innovation Centre, Dream Building, <br />
                University Enclave, University of Delhi, <br />
                New Delhi, India - 110007
              </p>
            </div>

            <div className="mt-6">
              <p className="text-deep-purple-100 italic">
                Quamble is a startup incubated under the IDEA scheme at Design Innovation Centre, Cluster Innovation Centre, University of Delhi.
              </p>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col justify-between pt-5 pb-10 border-t border-deep-purple-accent-200 sm:flex-row">
          <p className="text-sm text-gray-100">
            © Copyright {currentYear} Quamble. All rights reserved.
          </p>

 
 
          <div className="flex items-center mt-4 space-x-4 sm:mt-0">
             {/* Privacy Policy link */}
  <a
  href="/privacy-policy"
  className="text-base font-semibold text-black bg-white px-5 py-2 rounded-md border border-gray-300 shadow hover:bg-gray-100 transition duration-300 ml-4"
>
  Privacy Policy
</a>


           
            <a
              href="https://www.linkedin.com/company/104816648/admin/page-posts/published/"
              className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/socialPlatform/linkedin.png" alt="LinkedIn" className="w-6 h-auto" />
            </a>

            <a
              href="/"
              className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
            >
              <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
                <circle cx="15" cy="15" r="4" />
                <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z" />
              </svg>
            </a>

            <a
              href="/"
              className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788 
                c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22
                c1.105,0,2-0.895,2-2V2C24,0.895,23.105,0,22,0z" />
              </svg>
            </a>

          
          </div>
        </div>
      </div>
    </div>
  );
};
