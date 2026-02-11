import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './Hero';
import FAQ from './FAQ';
import PlanityHomePage from './PlanityHomePage';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <PlanityHomePage />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
