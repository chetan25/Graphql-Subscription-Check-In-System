import React from 'react';
import Container from '@material-ui/core/Container';
import OnlineReservation from './components/online-reservation';
import { CheckInStateProvider } from './hooks/machine-context';

const App = () => {
    return (
        <CheckInStateProvider>
            <Container maxWidth="md">
                <OnlineReservation/>
            </Container>
        </CheckInStateProvider>
    )
  }

  export default App;