import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { cancelCall } from '../../PreJoinScreens/calls';
import { useAppState } from '../../../state';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      background: theme.brand,
      color: 'white',
      '&:hover': {
        background: '#600101',
      },
    },
  })
);

export default function EndCallButton(props: { className?: string }) {
  const classes = useStyles();
  const { room } = useVideoContext();
  const { setError, callId } = useAppState();

  const handleDisconnect = () => {
    room.disconnect();
    alert('Disconnect');
    cancelCall(callId).catch(error => setError(error));
  };

  return (
    <Button onClick={handleDisconnect} className={clsx(classes.button, props.className)} data-cy-disconnect>
      Disconnect
    </Button>
  );
}
