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
    checkStatus: {
        textAlign: 'center'
    }
  }));

type CheckStatusProps = {
  updateResult: (data: {
    email: string, waitingStatus: {
        status: string,
        message: string
    },
    type: string
  }) => void;
}

const CheckStatus = ({updateResult}: CheckStatusProps) => {
   const client = useSubscriptionClient();
   const [state, send] = useGlobalStore();
   const checkInSubs = useRef(()=> {});
   const styles = useStyles();
   const [email, setEmail] = useState('');

   const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
   }

   const checkUserStatus = () => {
      if(!email) {
        return;
      }
      send('SUBMIT_CHECK_STATUS');

    //   const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString();

      const { unsubscribe } = pipe(
          client.subscription(
              `
                  subscription($id: String!) {
                      getQueueStatus(id: $id, type: "check-status") {
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
                  type: 'check-status'
              });
              if (result.data.getQueueStatus.status === 'not-found')  {
                send('CHECK_STATUS_ERROR')
              } else {
                send('CHECK_STATUS_COMPLETE')
              }
              if (
                result.data.getQueueStatus.status === 'done' ||
                result.data.getQueueStatus.status === 'not-found'
              ) {
                checkInSubs.current();
              }
          })
      );
      checkInSubs.current = unsubscribe;
   }

   return (
    <div className={styles.checkStatus}>
        <form className={styles.form} noValidate autoComplete="off">
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
            disabled={!email || state.matches('checkStatus.processCheckStatus')}
            onClick={checkUserStatus}
        >
            Check Staus
        </Button>
    </form>
    {
        state.matches('checkStatus.processCheckStatus') ? <CircularProgress disableShrink /> : null
    }
    </div> 
   );
}

export default CheckStatus;