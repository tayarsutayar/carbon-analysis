
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import Navbar from "./components/navbar";
import "./App.css";
import { useState } from "react";

const API_KEY = "AIzaSyDaPmqnqmA8eM8KjWiZF6aEflbBsSy-nd8"
const API_EP = "http://localhost:8000/api/analyze"

const App = () => {
  const [tab, setTab] = useState('explore')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: API_KEY,
  });
  const [config] = useState({
    center: { lat: -8.7286587, lng: 115.1987765 },
    zoom: 15,
    options: {
      zoomControl: false,
      tilt: 0,
      gestureHandling: 'none',
      mapTypeId: 'satellite',
      disableDefaultUI: true,
    }
  })

  const analyze = async () => {
    setLoading(true)
    const params = new URLSearchParams();
    params.append('url', `https://maps.googleapis.com/maps/api/staticmap?center=${config.center.lat},${config.center.lng}&zoom=${config.zoom}&size=600x600&maptype=${config.options.mapTypeId}&key=${API_KEY}`);
    const queryString = params.toString();
    const result = await fetch(API_EP+'?'+queryString)
    const imageBlob = await result.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setResult(imageObjectURL);
    setLoading(false)
    setTab('analysis')
  }

  return (
    <>
      <Navbar/>
      <div className="justify-between mx-auto max-w-[1200px] flex mt-5">
        <div className="block">
          <div className="flex">
            <button onClick={() => setTab('explore')} className={`px-4 py-3 rounded-lg hover:border ${tab == 'explore' ? 'border bg-stone-100' : ''}`} disabled={result== '' ? false : true}>Explore</button>
            <button onClick={() => setTab('analysis')} className={`px-4 py-3 rounded-lg hover:border ${tab == 'analysis' ? 'border bg-stone-100' : ''}`} disabled={result== '' ? true : false}>Result Analysis</button>
          </div>
          <div>
            {tab == 'explore' && <div className="w-[600px] h-[600px]">
              {!isLoaded ? (
                <h1>Loading...</h1>
              ) : (
                <GoogleMap
                  mapContainerClassName="map-container"
                  center={config.center}
                  zoom={config.zoom}
                  options={config.options}
                />
              )}
            </div>}
            {tab == 'analysis' && <div className="w-[600px] h-[600px]">
              <img src={result} alt="result" />
            </div>}
          </div>
        </div>
        {result != '' && <div className="w-[550px] h-[550px] z-20 bg-stone-100 rounded-xl p-2 shadow-lg border mt-8">
          <div className="w-[532px] h-[532px] z-20 bg-white rounded-xl border">
            <div className="flex justify-between items-center p-3 mx-auto border-b">
              <div className="relative z-10 max-w-max flex-1 items-center justify-center hidden md:flex">
                <div className="relative">
                  <h1 className="font-semibold text-lg">Analisis</h1>
                </div>
              </div>
            </div>
            <div className="p-3 block">
              <div>
                <label className="text-black">Jenis Hutan / Tanaman</label>
                <input className="border p-2 rounded-lg w-full mt-1" placeholder="Value" disabled/>
              </div>
              <div className="mt-3">
                <label className="text-black">Karbon Atas Permukaan(Ton / Ha)</label>
                <input className="border p-2 rounded-lg w-full mt-1" placeholder="Value" disabled/>
              </div>
              <div className="mt-3">
                <label className="text-black">Karbon Bawah Permukaan(Ton / Ha)</label>
                <input className="border p-2 rounded-lg w-full mt-1" placeholder="Value" disabled/>
              </div>
              <div className="mt-3">
                <label className="text-black">Harga Karbon</label>
                <input className="border p-2 rounded-lg w-full mt-1" placeholder="Rp" disabled/>
              </div>
            </div>
            <div className="px-3 flex items-center w-full">
              <button 
                onClick={() => {setResult('');setTab('explore')}}
                className="mx-auto rounded-lg bg-gray-200 py-2 px-4 hover:bg-gray-300 flex text-center font-semibold"
              >
                Reset Analyse 
              </button>
            </div>
          </div>
        </div>}

        {result == '' && <div className="w-[550px] h-[600px] z-20 bg-stone-100 rounded-xl p-2 shadow-lg border mt-8 flex items-center">
          <button onClick={analyze} className="bg-yellow-400 px-5 py-3 rounded-lg font-bold mx-auto my-auto" disabled={loading ? true : false}>
            {loading ? 'Loading....' : 'Analyze'}
          </button>
        </div>}
      </div>
    </>
  );
};

export default App