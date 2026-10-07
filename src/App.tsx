import { useState } from 'react';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Documents, type DocFilter } from './components/Documents';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Progress } from './components/Progress';
import { SvgSprite } from './components/SvgSprite';
import { Team } from './components/Team';
import { today } from './lib/today';

export function App() {
  // computed once per visit; everything date-dependent is derived from it
  const [dnes] = useState(() => today());
  // shared so "Zápisnice z tohto šprintu" in Progres can switch the filter in Dokumenty
  const [docFilter, setDocFilter] = useState<DocFilter>('all');

  return (
    <>
      <SvgSprite />
      <Nav />
      <main>
        <Hero dnes={dnes} />
        <About />
        <Progress dnes={dnes} onShowDocs={setDocFilter} />
        <Documents filter={docFilter} onFilter={setDocFilter} />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
