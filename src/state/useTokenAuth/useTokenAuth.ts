import { FormatListBulletedTwoTone } from '@material-ui/icons';
import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getTokenByCallId } from '../../components/PreJoinScreens/calls';
import { RoomType } from '../../types';

export function getPasscode() {
  const match = window.location.search.match(/passcode=(.*)&?/);
  const passcode = match ? match[1] : window.sessionStorage.getItem('passcode');
  return passcode;
}

export function fetchToken(
  userAccessToken: string,
  callId?: string
): Promise<{ isValid: boolean; token?: string; error?: string }> {
  if (!callId) {
    // TODO: Make configurable
    const chatId = 'C.D1.KDTP8B7ZBR';
    const userIds = [22994, 2010133];
    // create call if callId is empty - simulate call initiate by caller
    // and return token
    const headers = new window.Headers();
    headers.append('Authorization', userAccessToken);
    headers.append('content-type', 'application/json');

    const endpoint = `http://localhost:5000/api/calls`;
    return fetch(`${endpoint}`, {
      headers,
      method: 'POST',
      body: JSON.stringify({ chatId, userIds }),
    }).then(async res => {
      if (res.status === 409) {
        return { isValid: false, error: 'You have active call right now' };
      }
      const result = await res.json();

      if (!result.token || result.token === '') {
        return { isValid: false, error: 'Token is not valid: ' + result.token };
      }
      const { callId, roomId } = result.displayCall;
      console.log(`CALL_INFO for ${callId} call id and room id ${roomId}`, result.displayCall);
      return { isValid: true, token: result.token };
    });
  }
  return getTokenByCallId(userAccessToken, callId);
}

export function verifyPasscode(passcode: string) {
  // return Promise.resolve({ isValid: false, error: 'Simulate error' });
  return Promise.resolve({ isValid: true });
}

export function getErrorMessage(message: string) {
  switch (message) {
    case 'passcode incorrect':
      return 'Passcode is incorrect';
    case 'passcode expired':
      return 'Passcode has expired';
    default:
      return message;
  }
}

export default function usePasscodeAuth() {
  const history = useHistory();

  const [user, setUser] = useState<{
    displayName: undefined;
    photoURL: undefined;
    passcode: string;
  } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>();

  const getToken = useCallback(
    (name: string, room: string) => {
      setRoomType('group');
      return fetchToken(user!.passcode, room).then((res: { isValid: boolean; token?: string; error?: string }) => {
        if (res.isValid) {
          return res.token!;
        }
        throw new Error(getErrorMessage(res.error!));
      });
    },
    [user]
  );

  useEffect(() => {
    const passcode = getPasscode();

    setUser({ passcode } as any);
    window.sessionStorage.setItem('passcode', passcode!);

    history.replace(window.location.pathname);
    setIsAuthReady(true);
  }, [history]);

  const signIn = useCallback((passcode: string) => {
    return verifyPasscode(passcode).then((verification: any) => {
      if (verification?.isValid) {
        setUser({ passcode } as any);
        window.sessionStorage.setItem('passcode', passcode);
      } else {
        throw new Error(getErrorMessage(verification?.error));
      }
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.sessionStorage.removeItem('passcode');

    return Promise.resolve();
  }, []);

  return { user, isAuthReady, getToken, signIn, signOut, roomType };
}
