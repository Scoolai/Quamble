import React from "react";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content:
        "We may collect personal information such as your name, email address, and quiz performance data. This helps us provide personalized experiences and improve our platform.",
    },
    {
      title: "2. How We Use Your Information",
      content:
        "Your information is used to enhance your experience, communicate important updates, and analyze usage trends to improve our services.",
    },
    {
      title: "3. Data Protection",
      content:
        "We implement security measures to safeguard your data from unauthorized access, alteration, or disclosure.",
    },
    {
      title: "4. Sharing Your Information",
      content:
        "We do not sell or rent your personal information to third parties. Data may be shared with trusted partners only when necessary to deliver our services.",
    },
    {
      title: "5. Cookies",
      content:
        "Our website uses cookies to enhance user experience and collect analytics. You can control cookie settings through your browser preferences.",
    },
    {
      title: "6. Your Choices",
      content:
        "You can access, update, or delete your data anytime. For any privacy-related concerns, feel free to contact us.",
    },
  ];

  const bgColors = [
    "bg-red-50",
    "bg-blue-50",
    "bg-green-50",
    "bg-yellow-50",
    "bg-purple-50",
    "bg-indigo-50",
  ];

  return (
    <div className="bg-white text-black min-h-screen py-12 px-6 md:px-12 lg:px-24 xl:px-48">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-black">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-700">
            Your privacy is important to us. This privacy policy outlines how we collect, use, and protect your personal information when you interact with our platform.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sections.map((sec, idx) => {
            const colorClass = bgColors[idx % bgColors.length];
            return (
              <div
                key={idx}
                className={`transition-transform duration-300 ease-in-out border border-gray-200 p-6 shadow-md hover:shadow-lg hover:scale-105 ${colorClass} rounded-xl`}
              >
                <h2 className="text-xl font-bold text-black mb-3">
                  {sec.title}
                </h2>
              <p className="text-xs md:text-xl text-gray-800 leading-relaxed">
  {sec.content}
</p>


              </div>
            );
          })}
        </div>

        <footer className="pt-10 mt-12 border-t border-gray-200">
          <p className="text-base text-gray-600">
            By using our platform, you agree to the terms outlined in this privacy policy. We may update this policy from time to time and encourage you to review it periodically.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
