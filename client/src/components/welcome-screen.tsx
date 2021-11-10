import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useGlobalStore } from '../hooks/machine-context';

const useStyles = makeStyles((theme) => ({
    checkInWrapper: {
      textAlign: 'center',
      padding: '1rem'
    },
    header: {
        textAlign: 'center'
    },
    divider: {
        margin: '1rem'
    },
  }));

type WelcomeScreenProps = {
    startCheckIn: () => void
}

const WelComeScreen = ({
    startCheckIn
}: WelcomeScreenProps) => {
    const [_, send] = useGlobalStore();
    const styles = useStyles();

    return (
        <div className={styles.checkInWrapper}>
                   <Typography
                       variant="h6"
                       color="inherit"
                       noWrap
                       className={styles.header}
                   >
                   Start Check-In
                   </Typography>
                   <Button variant="contained" color="primary" onClick={startCheckIn}>Check-In</Button>

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
                   <Button variant="contained" color="primary" onClick={() => send('CHECK_STATUS')}>Check Status</Button>
              </div>
    )
}

export default WelComeScreen;