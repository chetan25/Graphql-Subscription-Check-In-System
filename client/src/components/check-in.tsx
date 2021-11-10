import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useGlobalStore } from '../hooks/machine-context';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';

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

const CheckIn = () => {
   const styles = useStyles();
   const [userName, setUserName] = useState('');
   const [email, setemail] = useState('');

   const handleUseNameChange = () => {

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
                    onChange={handleUseNameChange}
                    label="Email"
                />
            </FormControl>
            <Button variant="contained" color="primary">
                Send
            </Button>
        </form>
    </div> 
   );
}

export default CheckIn;