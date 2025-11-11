import { useReducer, useCallback } from 'react';
import { TestState, TestResults, SpeedDataPoint } from '../types';
import { DOWNLOAD_URL, PING_URL, PING_COUNT, LIVE_SPEED_UPDATE_INTERVAL_MS, TEST_DURATION_MS } from '../constants';

interface State {
  status: TestState;
  results: TestResults;
  liveSpeed: number;
  graphData: SpeedDataPoint[];
  error: string | null;
}

type Action =
  | { type: 'START' }
  | { type: 'SET_PING'; payload: number }
  | { type: 'ADD_PING_DATAPOINT'; payload: SpeedDataPoint }
  | { type: 'UPDATE_DOWNLOAD_SPEED'; payload: { speed: number; dataPoint: SpeedDataPoint } }
  | { type: 'FINISH_DOWNLOAD'; payload: number }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: State = {
  status: TestState.IDLE,
  results: { ping: 0, download: 0 },
  liveSpeed: 0,
  graphData: [],
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...initialState, status: TestState.PING };
    case 'SET_PING':
      return { ...state, status: TestState.DOWNLOAD, results: { ...state.results, ping: action.payload } };
    case 'ADD_PING_DATAPOINT':
      return { ...state, graphData: [...state.graphData, action.payload] };
    case 'UPDATE_DOWNLOAD_SPEED':
      return { ...state, liveSpeed: action.payload.speed, graphData: [...state.graphData, action.payload.dataPoint] };
    case 'FINISH_DOWNLOAD':
      return { ...state, status: TestState.RESULT, liveSpeed: 0, results: { ...state.results, download: action.payload } };
    case 'ERROR':
      return { ...state, status: TestState.ERROR, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      throw new Error('Unknown action type');
  }
}

export const useSpeedTest = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const measurePing = async (testStartTime: number) => {
    let totalLatency = 0;
    for (let i = 0; i < PING_COUNT; i++) {
      const startTime = performance.now();
      try {
        await fetch(`${PING_URL}&t=${Date.now()}`, { method: 'HEAD', cache: 'no-store', mode: 'cors' });
        const latency = performance.now() - startTime;
        totalLatency += latency;
        const time = (performance.now() - testStartTime) / 1000;
        dispatch({ type: 'ADD_PING_DATAPOINT', payload: { time, ping: latency, download: null } });
      } catch (e) {
         totalLatency += 500;
      }
    }
    const avgPing = totalLatency / PING_COUNT;
    dispatch({ type: 'SET_PING', payload: avgPing });
  };

  const measureDownloadSpeed = async (abortController: AbortController, testStartTime: number) => {
    const { signal } = abortController;
    let loadedBytes = 0;
    const downloadStartTime = performance.now();
    let lastUpdateTime = downloadStartTime;
    let lastLoadedBytes = 0;

    const interval = setInterval(() => {
      const currentTime = performance.now();
      const elapsedSeconds = (currentTime - lastUpdateTime) / 1000;
      if (elapsedSeconds > 0) {
        const bytesSinceLastUpdate = loadedBytes - lastLoadedBytes;
        const speedMbps = (bytesSinceLastUpdate * 8) / (elapsedSeconds * 1000 * 1000);
        
        dispatch({ type: 'UPDATE_DOWNLOAD_SPEED', payload: { 
            speed: speedMbps,
            dataPoint: { time: (currentTime - testStartTime) / 1000, download: speedMbps, ping: null }
        }});
      }
      
      lastUpdateTime = currentTime;
      lastLoadedBytes = loadedBytes;
    }, LIVE_SPEED_UPDATE_INTERVAL_MS);

    const testTimeout = setTimeout(() => abortController.abort(), TEST_DURATION_MS);

    try {
        const response = await fetch(`${DOWNLOAD_URL}&t=${Date.now()}`, { signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error("Response body is null");

        const reader = response.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            loadedBytes += value.length;
        }

        const durationSeconds = (performance.now() - downloadStartTime) / 1000;
        const finalSpeedMbps = (loadedBytes * 8) / (durationSeconds * 1000 * 1000);
        dispatch({ type: 'FINISH_DOWNLOAD', payload: finalSpeedMbps });
    } catch (e: any) {
        if (e.name === 'AbortError') {
            const durationSeconds = (performance.now() - downloadStartTime) / 1000;
            const finalSpeedMbps = loadedBytes > 0 ? (loadedBytes * 8) / (durationSeconds * 1000 * 1000) : 0;
            dispatch({ type: 'FINISH_DOWNLOAD', payload: finalSpeedMbps });
        } else {
            throw e;
        }
    } finally {
        clearTimeout(testTimeout);
        clearInterval(interval);
    }
  };
  
  const startTest = useCallback(async () => {
    if (state.status !== TestState.IDLE && state.status !== TestState.RESULT && state.status !== TestState.ERROR) return;

    dispatch({ type: 'START' });
    const abortController = new AbortController();
    const testStartTime = performance.now();

    try {
      await measurePing(testStartTime);
      await measureDownloadSpeed(abortController, testStartTime);
    } catch (e) {
      if (e instanceof Error) {
        dispatch({ type: 'ERROR', payload: e.message });
      } else if (typeof e === 'string') {
        dispatch({ type: 'ERROR', payload: e });
      } else {
        dispatch({ type: 'ERROR', payload: 'An unknown error occurred.' });
      }
      abortController.abort();
    }
  }, [state.status]);

  const resetTest = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, startTest, resetTest };
};