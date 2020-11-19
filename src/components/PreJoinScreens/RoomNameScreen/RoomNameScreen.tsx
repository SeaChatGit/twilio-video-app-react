import React, { ChangeEvent, FormEvent, useState } from 'react';
import {
  Typography,
  makeStyles,
  TextField,
  Grid,
  Button,
  InputLabel,
  Theme,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { useAppState } from '../../../state';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

interface RoomNameScreenProps {
  name: string;
  roomName: string;
  setName: (name: string) => void;
  setRoomName: (roomName: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>, caller: boolean) => void;
}

export default function RoomNameScreen({ name, roomName, setName, setRoomName, handleSubmit }: RoomNameScreenProps) {
  const [caller, setCaller] = useState(roomName === '');
  const classes = useStyles();
  const { user } = useAppState();

  const handleChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setCaller(checked);
    if (checked) {
      setRoomName('');
    }
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join a Room
      </Typography>
      <Typography variant="body1">
        {hasUsername
          ? "Enter the name of a room you'd like to join."
          : "Enter your name and the name of a room you'd like to join"}
      </Typography>
      <form onSubmit={e => handleSubmit(e, caller)}>
        <div className={classes.inputContainer}>
          {!hasUsername && (
            <div className={classes.textFieldContainer}>
              <FormControlLabel
                control={<Checkbox checked={caller} onChange={handleChange} name="gilad" />}
                label="Caller"
              />
              <div className={classes.textFieldContainer}>
                <InputLabel shrink htmlFor="input-room-name">
                  Existing Call ID
                </InputLabel>

                <TextField
                  disabled={caller}
                  id="input-user-name"
                  fullWidth
                  size="small"
                  value={roomName}
                  onChange={handleRoomNameChange}
                />
              </div>
            </div>
          )}
        </div>
        <Grid container justify="flex-end">
          <Button variant="contained" type="submit" color="primary" className={classes.continueButton}>
            Continue
          </Button>
        </Grid>
      </form>
    </>
  );
}
