import React, { createContext, useContext } from 'react';
import createCheckInMachine, {CheckInEvent, CheckInContext, CheckInState} from '../state-machine/checkIn-machine';
import { useMachine } from '@xstate/react';
import { State } from 'xstate';

export type StoreState = State<CheckInContext, CheckInEvent, any, CheckInState>;
export type StoreDispatch = any;


const StoreContext = createContext<[StoreState, StoreDispatch]>([
    {} as StoreState,
    () => {}
]);

export const CheckInStateProvider = (
    {children}: {children: React.ReactNode}
) => {
  const checkInMachineInstance = createCheckInMachine();
  
  const [state, send] = useMachine(checkInMachineInstance);

  return (
      <StoreContext.Provider value={[state, send]}>
        {children}
      </StoreContext.Provider>
  );
}

export const useGlobalStore = () => {
    return useContext(StoreContext);
};