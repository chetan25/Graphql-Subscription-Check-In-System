import { createMachine, assign } from 'xstate';

export type CheckInEvent = 
| {
    type: 'CHECK_STATUS'
} | {
    type: 'CHECK_IN'
} | {
    type: 'SUBMIT_CHECK_IN',
    value: {
        name: string;
        email: string;
    }
} | {
    type: 'SUBMIT_CHECK_STATUS',
    value: string
}

export type CheckInContext = {
  error: string;
  name: string;
  email: string;
  waitingStatusMessage: string;
  waitingStatus: number;
}

export type CheckInState = 
| {
    value: 'idle',
    context: CheckInContext
} | {
    value: 'checkIn',
    context: CheckInContext
} | {
    value: 'checkIn.startCheckIn',
    context: CheckInContext
} | {
    value: 'checkIn.processCheckIn',
    context: CheckInContext
} | {
    value: 'checkStatus',
    context: CheckInContext
} | {
    value: 'checkStatus.startCheckStatus',
    context: CheckInContext
} | {
    value: 'checkStatus.processCheckStatus',
    context: CheckInContext
} | {
    value: 'displayResults',
    context: CheckInContext
} | {
    value: 'failure',
    context: CheckInContext
}

const createCheckInMachine = () => {
    return createMachine<CheckInContext, CheckInEvent, CheckInState>({
        id: 'checkInState',
        initial: 'idle',
        states: {
            idle: {
                on: {
                    'CHECK_STATUS': 'checkStatus',
                    'CHECK_IN': 'checkIn'
                }
            },
            checkIn: {
               id: 'checkIn',
               initial: 'startCheckIn',
               states: {
                startCheckIn: {
                    on: {
                      'SUBMIT_CHECK_IN': 'processCheckIn'
                    }
                },
                processCheckIn: {
                    invoke: {
                        id: 'processCheckInRequest',
                        src: 'processCheckInRequest',
                        onDone: {
                          target: '#checkInState.displayResults'
                        },
                        onError: {
                          target: '#checkInState.failure'
                        }
                    }
                }
               }
            },
            checkStatus: {
                id: 'checkStatus',
                initial: 'startCheckStatus',
                states: {
                    startCheckStatus: {
                        on: {
                          'SUBMIT_CHECK_STATUS': 'processCheckStatus'
                        }
                    },
                    processCheckStatus: {
                        invoke: {
                            id: 'processCheckInRequest',
                            src: 'processCheckInRequest',
                            onDone: {
                              target: '#checkInState.displayResults'
                            },
                            onError: {
                              target: '#checkInState.failure'
                            }
                        }
                    }
                }
            },
            displayResults: {},
            failure: {}
        }
    });
}

export default createCheckInMachine;