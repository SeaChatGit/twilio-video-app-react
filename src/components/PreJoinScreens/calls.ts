import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RoomType } from '../../types';

export const API_URL = process.env.REACT_APP_API_URL;

export function getPasscode() {
  const match = window.location.search.match(/passcode=(.*)&?/);
  const passcode = match ? match[1] : window.sessionStorage.getItem('passcode');
  return passcode;
}

export function getTwilioToken() {
  const match = window.location.search.match(/twilioToken=(.*)&?/);
  const twilioToken = match ? match[1] : window.sessionStorage.getItem('twilioToken');
  return twilioToken;
}

export function getCallId() {
  const match = window.location.search.match(/callId=(.*)&?/);
  const passcode = match ? match[1] : window.sessionStorage.getItem('roomId');
  return passcode;
}

export enum CallStatusType {
  InProgress = 0,
  Completed = 1,
}

interface DisplayCall {
  callId: string;
  roomId: string; // 'RM0a242a4ef0e0921fbf48745fb63764a6';
  chatId: string; //'C.D1.7UWIL7JWN9';
  name: string; //'CChat 1F CChat 1L';
  imageUrl: string;
  callStatus: CallStatusType; // 0 - in progress, 1 - completed
}

export function getCall(userAccessToken: string, callId: string): Promise<DisplayCall> {
  const headers = new window.Headers();
  headers.append('Authorization', userAccessToken);
  const endpoint = `${API_URL}/calls/${callId}`;
  const params = new window.URLSearchParams({ callIdString: callId });
  return fetch(`${endpoint}?${params}`, { headers }).then(async res => {
    const result = await res.json();
    if (!result.name) {
      throw new Error('Wrong response: ' + result);
    }
    return result;
  });
}

export function getTokenByCallId(userAccessToken: string, callId: string) {
  const headers = new window.Headers();
  headers.append('Authorization', userAccessToken);
  const endpoint = API_URL + `/calls/${callId}/token`;
  return fetch(`${endpoint}`, { headers }).then(async res => {
    if (res.status === 409) {
      return { isValid: false, error: `The specified call ${callId} is no longer active.` };
    }

    const result = await res.json();

    if (!result.token || result.token === '') {
      return { isValid: false, token: 'Call Token is not valid: ' + result.token };
    }
    return { isValid: true, token: result.token, callId };
  });
}

export function cancelCall(callId: string) {
  const headers = new window.Headers();
  headers.append('Authorization', getPasscode()!);
  const endpoint = `${API_URL}/calls/${callId}`;
  return fetch(`${endpoint}`, { headers, method: 'DELETE' }).then(async res => {
    if (res.status === 409) {
      return { isValid: false, error: `A call ${callId} is currently completed for this chat.` };
    }

    const result = await res.json();

    if (!result.token || result.token === '') {
      return { isValid: false, token: 'Call Token is not valid: ' + result.token };
    }
    return { isValid: true, token: result.token };
  });
}
