import React, { useEffect, useState } from 'react';
import { pipe, subscribe } from 'wonka';
import { useSubscriptionClient } from '../hooks/subscription';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

// import FormControl from '@material-ui/core/FormControl';
// import InputLabel from '@material-ui/core/InputLabel';
// import OutlinedInput from '@material-ui/core/OutlinedInput';
// import Button from '@material-ui/core/Button';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { useGlobalStore } from '../hooks/machine-context';
import WelComeScreen from './welcome-screen';
import CheckIn from './check-in';

const useStyles = makeStyles((theme) => ({
    '@global': {
      a: {
        textDecoration: 'none',
      },
    },
    appContainer: {
        marginTop: '2rem'
    },
    welcomeWrapper: {
        maxHeight: '100vh',
        height: '80vh',
        margin: '1rem'
    },
    checkInWrapper: {
      textAlign: 'center',
      padding: '1rem'
    },
    form: {
        '& > *': {
          margin: theme.spacing(2),
          width: '50ch',
        },
      },
    header: {
        textAlign: 'center'
    },
    divider: {
        margin: '1rem'
    },
    listItem: {
        position: 'relative',
        display: 'inline-block',
        '&::before': {
            content: "''",
            position: 'absolute',
            display:'block',
            width: '100%',
            transform: 'translateX(-50%)',
            left: '50%',
            bottom: 0,
            right: '80%',
            height: '1%',
            zIindex: '-1',
            background: 'red',
        }
    }
  }));

const GameApp = () => {
    const [state, send] = useGlobalStore();
    const [waitingTime, setWaitingTime] = useState<string | null>(null);

    const styles = useStyles();
    const client = useSubscriptionClient();

    const startCheckIn = () => {
        const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString();

        const { unsubscribe: unsubscribeStatus } = pipe(
            client.subscription(
                `
                    subscription($id: String!) {
                        getQueueStatus(id: $id)
                    }
                `, {
                    id: id
                }
            ),
            subscribe(result => {
                console.log({result})
                // setPlayerStatus(result.data.getQueueStatus);
            })
        );
        send('CHECK_IN');
    }

    useEffect(() => {
        const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString();

        const { unsubscribe: unsubscribeStatus } = pipe(
            client.subscription(
                `
                    subscription {
                        watingTime
                    }
                `
            ),
            subscribe(result => {
                console.log({result})
                setWaitingTime(result.data.watingTime);
            })
        )

        return () => {
            client.mutation(`
                    mutation($id: String!){
                        unSubscribe(id: $id)
                    }
            `, {
                id: id
            }).toPromise();

            unsubscribeStatus()
        }
    }, []);


    return (
        <Container maxWidth="md" className={styles.appContainer}>
           <Typography
                variant="h3"
                color="inherit"
                noWrap
                className={styles.header}
            >
                Welcome To Self Serve
            </Typography>
            {
                waitingTime ? <Typography
                 color="inherit"
                 noWrap
                 className={styles.header}
             >
                 {waitingTime}......
             </Typography> : null
            }
            <Divider variant='middle'/>
            <Box id="welcome" className={styles.welcomeWrapper}>
               {
                   state.matches('idle') ? <WelComeScreen startCheckIn={startCheckIn}/> : null
               }
               {
                   state.matches('checkIn') ? <CheckIn /> : null
               }
                {
                   state.matches('checkStatus') ? <h2>Check Status</h2> : null
                }
                {
                   state.matches('displayResults') ? <h2>Display Results</h2> : null
                }
            </Box>
            
       </Container>
    )
  }

  export default GameApp;