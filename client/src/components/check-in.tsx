import React, {useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useGlobalStore } from '../hooks/machine-context';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { useSubscriptionClient } from '../hooks/subscription';
import { pipe, subscribe } from 'wonka';
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles((theme) => ({
    form: {
        '& > *': {
          margin: theme.spacing(2),
          width: '50ch',
        },
      },
    header: {
        textAlign: 'center'
    },
    checkIn: {
        textAlign: 'center'
    }
  }));

type CheckInProps = {
  updateResult: (data: {
     email: string, waitingStatus: {
        status: string,
        message: string
     },
     type: string
  }) => void;
}

const CheckIn = ({updateResult}: CheckInProps) => {
   const client = useSubscriptionClient();
   const [state, send] = useGlobalStore();
   const checkInSubs = useRef(()=> {});
   const styles = useStyles();
   const [userName, setUserName] = useState('');
   const [email, setEmail] = useState('');

   const handleUseNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
   }

   const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
   }

   const checkInUser = () => {
      if(!email || !userName) {
        return;
      }
      send('SUBMIT_CHECK_IN');

    //   const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString();

      const { unsubscribe } = pipe(
          client.subscription(
              `
                  subscription($id: String!) {
                      getQueueStatus(id: $id,  type: "check-in") {
                          status,
                          message
                      }
                  }
              `, {
                  id: email
              }
          ),
          subscribe(result => {
              updateResult({
                  email: email,
                  waitingStatus: result.data.getQueueStatus,
                  type: 'check-in'
              });
              send('CHECK_IN_COMPLETE');
              if (result.data.getQueueStatus.status === 'done') {
                checkInSubs.current();
              }
          })
      );
      checkInSubs.current = unsubscribe;
   }


   return (
    <div className={styles.checkIn}>
        <form className={styles.form} noValidate autoComplete="off">
            <FormControl variant="outlined">
                <InputLabel htmlFor="component-outlined">Name</InputLabel>
                <OutlinedInput
                    id="component-outlined"
                    value={userName}
                    onChange={handleUseNameChange}
                    label="Name"
                />
            </FormControl>
            <FormControl variant="outlined">
                <InputLabel htmlFor="component-outlined">Email</InputLabel>
                <OutlinedInput
                    id="component-outlined"
                    value={email}
                    onChange={handleEmailChange}
                    label="Email"
                />
            </FormControl>
            <Button
                variant="contained"
                color="primary"
                disabled={!email || !userName || state.matches('checkIn.processCheckIn')}
                onClick={checkInUser}
            >
                Check-In
            </Button>
        </form>
        {
            state.matches('checkIn.processCheckIn') ? <CircularProgress disableShrink /> : null
        }
    </div> 
   );
}

export default CheckIn;