import { HomeIcon, InformationCircleIcon } from '@heroicons/react/24/solid'

const Navbar = () => {

  return (
    <div className="sticky top-0 z-50 border-b bg-white text-foreground">
      <div className="flex h-20 justify-between items-center px-4 mx-auto max-w-[1200px]">
        <div className="relative z-10 max-w-max flex-1 items-center justify-center hidden md:flex">
          <div className="relative">
            <h1 className="font-bold text-2xl">Penilaian Karbon</h1>
            <span className="text-gray-400">Tim Ember Proyek</span>
          </div>
        </div>
        <div className="ml-auto flex gap-1">
          <nav className="relative z-10 max-w-max flex-1 items-center justify-center hidden md:flex">
            <div className="relative">
              <ul className="group flex flex-1 list-none items-center justify-center space-x-1">
                <li>
                  <a className="flex flex-row text-md me-3 font-medium transition-colors hover:text-primary" href="/">
                    <div className="flex content-center">
                      <HomeIcon className="size-5 mr-1" /><span>Home</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a className="flex flex-row text-md me-3 font-medium transition-colors hover:text-primary" href="/">
                    <div className="flex content-center">
                      <InformationCircleIcon className="size-5 mr-1" /><span>About</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar