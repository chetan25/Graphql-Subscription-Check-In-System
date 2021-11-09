import React, { useEffect, useState } from 'react';

import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { pipe, subscribe } from 'wonka';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

import { useGlobalStore } from '../hooks/machine-context';
import { assertNullableType } from 'graphql';

// subscription client
const subscriptionClient = new SubscriptionClient(
    "ws://localhost:4000",
    {
       reconnect: true
    }
)

// create client
const client = createClient({
  url: 'http://localhost:4000',
  exchanges: [
      ...defaultExchanges,
      subscriptionExchange({
          forwardSubscription: (operation) => subscriptionClient.request(operation) as any
      })
  ]
});


const useStyles = makeStyles((theme) => ({
    '@global': {
      a: {
        textDecoration: 'none',
      },
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
    const [playerStatus, setPlayerStatus] = useState('');

    const styles = useStyles();

    useEffect(() => {
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
                setPlayerStatus(result.data.getQueueStatus);
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
        <Container maxWidth="md">
           <Typography
                variant="h3"
                color="inherit"
                noWrap
                className={styles.header}
            >
                Welcome To Self Serve
            </Typography>
            <Divider variant='middle'/>
            <Box id="welcome" className={styles.welcomeWrapper}>
               {
                   state.matches('idle') ? <div className={styles.checkInWrapper}>
                   <Typography
                       variant="h6"
                       color="inherit"
                       noWrap
                       className={styles.header}
                   >
                   Start Check-In
                   </Typography>
                   <Button variant="contained" color="primary" onClick={() => send('CHECK_IN')}>Check-In</Button>

                   <Typography
                       variant="h4"
                       color="inherit"
                       noWrap
                       className={styles.divider}
                   >
                       OR
                   </Typography>

                   <Typography
                       variant="h6"
                       color="inherit"
                       noWrap
                       className={styles.header}
                   >
                     Check Your Status
                   </Typography>
                   <Button variant="contained" color="primary">Check Status</Button>
              </div> : null
               }
               {
                   state.matches('checkIn') ? <h2>Check IN</h2> : assertNullableType
               }
            </Box>
            
       </Container>
    )
  }

  export default GameApp;