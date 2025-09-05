import React from "react";

const Home = () => {
  return (
    <div className="h-[100vh] flex items-center justify-center">
      <img
        src="heroimage4.jpg"
        alt="hero-image"
        className="w-full h-full object-cover relative"
      />
      <div className="bg-white/30 backdrop-blur-md absolute p-10 max-lg:h-[100vh] flex items-center justify-center flex-col">
        <p className="text-5xl font-semibold text-center">
          THE LIBRARY THAT'S ALWAYS OPEN.
          <br />
          SHOP ONLINE WITH US.
        </p>
        <p className="mt-5 text-center">
          Explore a world of stories, knowledge, and imagination. From timeless
          classics to the latest bestsellers — your next adventure starts here.
        </p>
        <button className="px-4 py-2 bg-blue-400 rounded-full mt-5">
          Shop now
        </button>
      </div>
    </div>
  );
};

export default Home;
