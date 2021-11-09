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
import Divider from '@material-ui/core/Divider';

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

type Message = {
    from: string;
    message: string;
}

const useStyles = makeStyles((theme) => ({
    '@global': {
      a: {
        textDecoration: 'none',
      },
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

  const ChatApp = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const styles = useStyles();

    useEffect(() => {
        const { unsubscribe } = pipe(
            client.subscription(
                `
                    subscription{
                        messages{
                           message
                           from
                        }
                    }
                `
            ),
            subscribe(result => {
                setMessages(result.data.messages as Message[]);
            })
        );
    }, []);

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserMessage(e.target.value);
    }

    const submitMessage = async () => {
       await client.mutation(`
            mutation($message: String!, $from: String!){
                addMessage(message: $message, from:  $from) {
                message
                from
                }
            }
       `, {
           message: userMessage,
           from: 'user'
       }).toPromise();

       setUserMessage('');
    }

    return (
        <Container maxWidth="md">
           <Typography
                variant="h2"
                color="inherit"
                noWrap
                className={styles.header}
            >
                Welcome User
            </Typography>
            <Divider variant='middle'/>
            <form className={styles.form} noValidate autoComplete="off">
                <FormControl variant="outlined">
                    <InputLabel htmlFor="component-outlined">Message</InputLabel>
                    <OutlinedInput
                       id="component-outlined"
                       value={userMessage}
                       onChange={handleMessageChange}
                       label="Message"
                    />
                </FormControl>
                <Button variant="contained" color="primary" onClick={submitMessage}>
                    Send
                </Button>
            </form>
            <List aria-label="chat messages">
                {
                    messages.map((message, index) => {
                        return <ListItem key={index} className={styles.listItem}>
                            <ListItemText>
                                <span>{message.from} ----- {message.message}</span>
                            </ListItemText>
                        </ListItem>
                    })
                }
               
            </List>
       </Container>
    )
  }

  export default ChatApp;