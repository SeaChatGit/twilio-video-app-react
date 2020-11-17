import { nanoid } from 'nanoid';
import { useAppState } from '../../../../state';
import { useState, useEffect } from 'react';
import { getPasscode } from '../../../../state/usePasscodeAuth/usePasscodeAuth';

export default function useGetPreflightTokens() {
  const { getToken } = useAppState();
  const [tokens, setTokens] = useState<[string, string]>();
  const [tokenError, setTokenError] = useState<Error>();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isFetching && !tokens) {
      setIsFetching(true);

      const headers = new window.Headers();
      headers.append('Authorization', getPasscode()!);
      const endpoint = `http://localhost:5000/api/calls/diagnosticTokens`;
      fetch(`${endpoint}`, { headers })
        .then(async res => {
          const result = await res.json();
          if (!result.publisherIdentityToken || result.publisherIdentityToken === '') {
            throw new Error('publisherIdentityToken is not valid: ' + result.token);
          }
          setTokens([result.publisherIdentityToken, result.subscriberIdentityToken]);
          setIsFetching(false);
        })
        .catch(error => setTokenError(error));
    }
  }, [getToken, isFetching, tokens]);

  return { tokens, tokenError };
}
