import React, { useState, useEffect } from 'react';
import { useSpeedTest } from './hooks/useSpeedTest';
import { TestState, SpeedUnit } from './types';
import Gauge from './components/Gauge';
import SpeedChart from './components/SpeedChart';
import { PingIcon, DownloadIcon } from './components/icons';

const INITIAL_MAX_SPEED = 50; // In Mbps

const App: React.FC = () => {
  const { state, startTest, resetTest } = useSpeedTest();
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('Mbps');
  
  const [downloadGaugeMax, setDownloadGaugeMax] = useState(INITIAL_MAX_SPEED);

  useEffect(() => {
    if (state.status === TestState.IDLE || state.status === TestState.ERROR) {
      setDownloadGaugeMax(INITIAL_MAX_SPEED);
      return;
    }

    const maxDownload = state.graphData.reduce((max, p) => Math.max(max, p.download ?? 0), 0);

    if (maxDownload > downloadGaugeMax) {
      setDownloadGaugeMax(Math.ceil(maxDownload / 50) * 50);
    }
  }, [state.graphData, state.status]);

  const getStatusText = () => {
    switch (state.status) {
      case TestState.IDLE:
        return 'Start Test';
      case TestState.PING:
        return 'Testing Ping...';
      case TestState.DOWNLOAD:
        return 'Testing Download...';
      case TestState.RESULT:
        return 'Test Again';
      case TestState.ERROR:
        return 'Retry Test';
      default:
        return 'Start';
    }
  };
  
  const isTesting = state.status !== TestState.IDLE && state.status !== TestState.RESULT && state.status !== TestState.ERROR;

  const getConversionFactor = (unit: SpeedUnit) => {
    switch (unit) {
      case 'Kbps': return 1000;
      case 'MB/s': return 1 / 8;
      default: return 1; // Mbps
    }
  };
  const conversionFactor = getConversionFactor(speedUnit);
  
  const downloadValue = (state.status === TestState.DOWNLOAD ? state.liveSpeed : state.results.download) * conversionFactor;

  const chartData = state.graphData.map(d => ({
    time: d.time,
    download: d.download !== null ? d.download * conversionFactor : null,
  }));
  
  const yDomainMax = (Math.max(INITIAL_MAX_SPEED, downloadGaugeMax)) * conversionFactor;

  return (
    <div className="min-h-screen bg-base font-sans flex flex-col items-center justify-center p-4 selection:bg-primary/30">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">ISHITHAWW</h1>
        <p className="text-secondary mt-2">Measure your network performance in real-time.</p>
      </header>

      <main className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6">
        <div className="flex justify-center items-center">
          <div className="bg-dark/50 rounded-full p-1 flex space-x-1">
            <button onClick={() => setSpeedUnit('Mbps')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${speedUnit === 'Mbps' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark'}`}>Mbps</button>
            <button onClick={() => setSpeedUnit('MB/s')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${speedUnit === 'MB/s' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark'}`}>MB/s</button>
            <button onClick={() => setSpeedUnit('Kbps')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${speedUnit === 'Kbps' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark'}`}>Kbps</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:max-w-2xl">
            <Gauge 
                label="Ping" 
                unit="ms" 
                value={state.results.ping} 
                maxValue={200} 
                icon={<PingIcon className={`w-6 h-6 ${state.status === TestState.PING ? 'text-primary animate-pulse' : ''}`} />}
            />
            <Gauge 
                label="Download" 
                unit={speedUnit}
                value={downloadValue} 
                maxValue={downloadGaugeMax * conversionFactor}
                icon={<DownloadIcon className={`w-6 h-6 ${state.status === TestState.DOWNLOAD ? 'text-primary animate-pulse' : ''}`} />}
            />
        </div>

        <div className="w-full">
            <SpeedChart data={chartData} yDomain={[0, yDomainMax]} unit={speedUnit} />
        </div>
        
        <div className="w-full max-w-xs">
          <button
            onClick={isTesting ? undefined : (state.status === TestState.IDLE ? startTest : resetTest)}
            disabled={isTesting}
            aria-label={getStatusText()}
            className="w-full bg-primary text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isTesting ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {getStatusText()}
                </div>
            ) : getStatusText()}
          </button>
          {state.error && <p className="text-red-400 mt-4 text-center" role="alert">Error: {state.error}</p>}
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;
