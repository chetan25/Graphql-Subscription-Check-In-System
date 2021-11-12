import React, { useEffect, useState } from 'react';
import { pipe, subscribe } from 'wonka';
import { useSubscriptionClient } from '../hooks/subscription';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { useGlobalStore } from '../hooks/machine-context';
import WelComeScreen from './welcome-screen';
import CheckIn from './check-in';
import CheckStatus from './check-status';

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

const OnlineReservation = () => {
    const [state, send] = useGlobalStore();
    const [waitingTime, setWaitingTime] = useState<string | null>(null);
    const [checkInResult, setCheckInResult] = useState({
        type: '',
        message: '',
        status: ''
    });

    const styles = useStyles();
    const client = useSubscriptionClient();

    const startCheckIn = () => {
        send('CHECK_IN');
    }

    const startAgain = () => {
       send('START_AGAIN');
    }

    useEffect(() => {
        // const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString();

        const { unsubscribe: unsubscribeStatus } = pipe(
            client.subscription(
                `
                    subscription {
                        watingTime
                    }
                `
            ),
            subscribe(result => {
                setWaitingTime(result.data.watingTime);
            })
        )

        return () => {
            // client.mutation(`
            //         mutation($id: String!){
            //             unSubscribe(id: $id)
            //         }
            // `, {
            //     id: id
            // }).toPromise();

            unsubscribeStatus()
        }
    }, []);

    const updateResult = ({ email, waitingStatus, type}: {
         email: string, waitingStatus: {
             status: string,
             message: string
         },
         type: string
      }) => {
          let message = `${waitingStatus.message}`;
          if (type === 'check-in' && status === 'success') {
            message = `${message}. You can check your status anytime with your email address ${email}`
          }
        
         setCheckInResult({
             type,
             message,
             status: waitingStatus.status
         })
    }

    return (
        <Container maxWidth="md" className={styles.appContainer}>
           
            {  !state.matches('idle') ? <IconButton
                    aria-label="back"
                    size="small"
                    onClick={startAgain}
                >
                    <ArrowBackIcon />
                </IconButton> : null
            }
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
                   state.matches('checkIn') ? <CheckIn updateResult={updateResult}/> : null
               }
                {
                   state.matches('checkStatus') ? <CheckStatus updateResult={updateResult} /> : null
                }
                {
                   state.matches('displayResults') ? (
                    <div>
                        <h2>Check In Status</h2>
                        <p>{checkInResult.message}</p>
                    </div>
                   ) : null
                }
                 {
                   state.matches('failure') ? (
                    <div>
                        <h2>{
                            checkInResult.status === 'not-found' ? 
                                'Opps Something went wrong' : 'Error!!!!'
                         }</h2>
                        <p>{checkInResult.message}</p>
                        {
                           checkInResult.status === 'not-found' ?
                             <Button variant="contained" color="primary" onClick={startCheckIn}>Check-In</Button> :
                             <Button variant="contained" color="primary" onClick={startAgain}>Go Back</Button>
                        }
                    </div>
                   ) : null
                }
            </Box>
            
       </Container>
    )
  }

  export default OnlineReservation;