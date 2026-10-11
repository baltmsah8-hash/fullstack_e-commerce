import Home from './home/page';
import Collection from './collection/page';
import About from './about/page';
import Contact from './contact/page';

const Main = () => {
  return(
    <main className="flex flex-col gap-10 bg-white">
      <Home />
      <Collection />
      <About />
      <Contact />
    </main>
  );
};

export default Main;