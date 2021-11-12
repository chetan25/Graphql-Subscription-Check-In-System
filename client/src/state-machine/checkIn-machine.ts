import { createMachine, assign } from 'xstate';

export type CheckInEvent = 
| {
    type: 'CHECK_STATUS'
} | {
    type: 'CHECK_IN'
} | {
    type: 'SUBMIT_CHECK_IN',
} | {
    type: 'SUBMIT_CHECK_STATUS'
} | {
    type: 'CHECK_IN_COMPLETE'
} | {
    type: 'CHECK_IN_ERROR'
} | {
    type: 'CHECK_STATUS_COMPLETE'
} | {
    type: 'CHECK_STATUS_ERROR'
} | {
    type: 'START_AGAIN'
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
                    on: {
                        'CHECK_IN_COMPLETE': '#checkInState.displayResults',
                        'CHECK_IN_ERROR': '#checkInState.failure'
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
                        on: {
                            'CHECK_STATUS_COMPLETE': '#checkInState.displayResults',
                            'CHECK_STATUS_ERROR': '#checkInState.failure'
                        }
                    }
                }
            },
            displayResults: {},
            failure: {
                on: {
                    'CHECK_IN': 'checkIn'
                }
            }
        },
        on: {
            'START_AGAIN': 'idle',
        }
    });
}

export default createCheckInMachine;