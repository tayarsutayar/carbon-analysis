
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import Navbar from "./components/navbar";
import "./App.css";
import { useState } from "react";

const API_KEY = "AIzaSyDaPmqnqmA8eM8KjWiZF6aEflbBsSy-nd8"
const API_EP = "http://localhost:8000/api"

const App = () => {
  const [map, setMap] = useState<google.maps.Map>()
  const [tab, setTab] = useState('explore')
  const [loading, setLoading] = useState(false)
  const defaultResult = {
    'jenis': 'Hutan Mangrove',
    'karbon_atas': 0,
    'karbon_bawah': 0,
    'harga_karbon': 'Rp. 0',
    'output_path': ''
  }
  const [result, setResult] = useState(defaultResult)
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: API_KEY,
  });
  const [config, setConfig] = useState({
    center: { lat: -8.7286587, lng: 115.1987765 },
    zoom: 15,
    options: {
      zoomControl: false,
      tilt: 0,
      gestureHandling: 'auto',
      mapTypeId: 'satellite',
      disableDefaultUI: true,
    }
  })

  const analyze = async () => {
    setLoading(true)
    try{
      const params = new URLSearchParams();
      params.append('url', `https://maps.googleapis.com/maps/api/staticmap?center=${config.center.lat},${config.center.lng}&zoom=${config.zoom}&size=600x600&maptype=${config.options.mapTypeId}&key=${API_KEY}`);
      const queryString = params.toString();
      const response = await fetch(API_EP+'/analyze?'+queryString)

      const result = await response.json()
      
      const paramsImage = new URLSearchParams();
      paramsImage.append('path', result.output_path);
      const queryStringImage = paramsImage.toString();
      const image = await fetch(API_EP+'/get_image?'+queryStringImage)
      const imageBlob = await image.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setResult({
        'jenis': result.jenis,
        'karbon_atas': result.karbon_atas,
        'karbon_bawah': result.karbon_bawah,
        'harga_karbon': result.harga_karbon,
        'output_path': imageObjectURL
      });

      setLoading(false)
      setTab('analysis')
    }
    catch(e){
      console.error(e)
      setLoading(false)
      alert("Something Went Wrong, check console for more information")
    }
  }

  const handleZoomChanged = () => {
    config.zoom = map?.getZoom() || config.zoom
    setConfig({ ...config });
  }

  const handleCenterChanged = () => {
    config.center.lat = map?.getCenter()?.lat() || config.center.lat
    config.center.lng = map?.getCenter()?.lng() || config.center.lng
    setConfig({ ...config });
  };

  return (
    <>
      <Navbar/>
      <div className="justify-between mx-auto max-w-[1200px] flex mt-5">
        <div className="block">
          <div className="flex">
            <button onClick={() => setTab('explore')} className={`px-4 py-3 rounded-lg hover:border ${tab == 'explore' ? 'border bg-stone-100' : ''}`} disabled={result.output_path == '' ? false : true}>Explore</button>
            <button onClick={() => setTab('analysis')} className={`px-4 py-3 rounded-lg hover:border ${tab == 'analysis' ? 'border bg-stone-100' : ''}`} disabled={result.output_path == '' ? true : false}>Result Analysis</button>
          </div>
          <div>
            {tab == 'explore' && <div className="w-[600px] h-[600px]">
              {!isLoaded ? (
                <h1>Analyzing...</h1>
              ) : (
                <GoogleMap
                  onLoad={map => {
                    setMap(map)
                  }}
                  mapContainerClassName="map-container"
                  center={config.center}
                  zoom={config.zoom}
                  options={config.options}
                  onZoomChanged={handleZoomChanged}
                  onCenterChanged={handleCenterChanged}
                />
              )}
            </div>}
            {tab == 'analysis' && <div className="w-[600px] h-[600px]">
              <img src={result.output_path} alt="result" />
            </div>}
          </div>
        </div>
        {result.output_path != '' && <div className="w-[550px] h-[550px] z-20 bg-stone-100 rounded-xl p-2 shadow-lg border mt-8">
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
                <input className="border p-2 rounded-lg w-full mt-1" value={result.jenis} disabled/>
              </div>
              <div className="mt-3">
                <label className="text-black">Karbon Atas Permukaan(Ton / Ha)</label>
                <input className="border p-2 rounded-lg w-full mt-1" value={result.karbon_atas} disabled/>
              </div>
              <div className="mt-3">
                <label className="text-black">Karbon Bawah Permukaan(Ton / Ha)</label>
                <input className="border p-2 rounded-lg w-full mt-1" value={result.karbon_bawah} disabled/>
              </div>
              <div className="mt-3">
                <label className="text-black">Harga Karbon</label>
                <input className="border p-2 rounded-lg w-full mt-1" value={result.harga_karbon} disabled/>
              </div>
            </div>
            <div className="px-3 flex items-center w-full">
              <button 
                onClick={() => {setResult(defaultResult);setTab('explore')}}
                className="mx-auto rounded-lg bg-gray-200 py-2 px-4 hover:bg-gray-300 flex text-center font-semibold"
              >
                Reset Analyse 
              </button>
            </div>
          </div>
        </div>}

        {result.output_path == '' && <div className="w-[550px] h-[600px] z-20 bg-stone-100 rounded-xl p-2 shadow-lg border mt-8 flex items-center">
          <button onClick={analyze} className="bg-yellow-400 px-5 py-3 rounded-lg font-bold mx-auto my-auto" disabled={loading ? true : false}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>}
      </div>
    </>
  );
};

export default App