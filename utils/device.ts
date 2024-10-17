import { observable } from '@legendapp/state';

export const device$ = observable({
  nfcEnabled: null as boolean | null,
  nfcSupported: null as boolean | null,
  qrEnabled: null as boolean | null,
});
