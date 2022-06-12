import { useCallback, useEffect, useState } from 'react';

// line 12, this one
import { httpGetLaunches, httpSubmitLaunch, httpAbortLaunch } from './requests';

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([]);
  const [isPendingLaunch, setPendingLaunch] = useState(false);

  // save our application from needlessly recomputing useing the useCallback function
  const getLaunches = useCallback(async () => {
    // these http functions are being imported from the 2nd import request above
    const fetchedLaunches = await httpGetLaunches();
    saveLaunches(fetchedLaunches);
  }, []);

  useEffect(() => {
    getLaunches();
  }, [getLaunches]);

  const submitLaunch = useCallback(
    async (e) => {
      e.preventDefault();
      setPendingLaunch(true);
      const data = new FormData(e.target);
      const launchDate = new Date(data.get('launch-day'));
      const mission = data.get('mission-name');
      const rocket = data.get('rocket-name');
      const target = data.get('planets-selector');
      const response = await httpSubmitLaunch({
        launchDate,
        mission,
        rocket,
        target,
      });

      // Set success based on response.
      const success = response.ok;
      if (success) {
        getLaunches();
        setTimeout(() => {
          setPendingLaunch(false);
          onSuccessSound();
        }, 800);
      } else {
        onFailureSound();
      }
    },
    [getLaunches, onSuccessSound, onFailureSound]
  );

  // abort launch when user presses x button
  const abortLaunch = useCallback(
    async (id) => {
      const response = await httpAbortLaunch(id);

      // Set success based on response.
      const success = response.ok;
      if (success) {
        getLaunches();
        onAbortSound();
      } else {
        onFailureSound();
      }
    },
    [getLaunches, onAbortSound, onFailureSound]
  );

  // the data managed from our hook so we can use them in our AppLayout
  return {
    launches,
    isPendingLaunch,
    submitLaunch,
    abortLaunch,
  };
}

export default useLaunches;
