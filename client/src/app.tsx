import React from 'react';
import Container from '@material-ui/core/Container';
import GameApp from './components/game';
import { CheckInStateProvider } from './hooks/machine-context';

const App = () => {
    return (
        <CheckInStateProvider>
            <Container maxWidth="md">
                <GameApp/>
            </Container>
        </CheckInStateProvider>
    )
  }

  export default App;