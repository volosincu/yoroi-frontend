// @flow

// Define types that are exposed to connect to the API layer

import BigNumber from 'bignumber.js';
import { defineMessages } from 'react-intl';
import LocalizableError from '../i18n/LocalizableError';
import WalletTransaction from '../domain/WalletTransaction';
import Wallet from '../domain/Wallet';

const messages = defineMessages({
  genericApiError: {
    id: 'api.errors.GenericApiError',
    defaultMessage: '!!!An error occurred, please try again later.',
    description: 'Generic error message.'
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
    description: '"Incorrect wallet password." error message.'
  },
  walletAlreadyRestoredError: {
    id: 'api.errors.WalletAlreadyRestoredError',
    defaultMessage: '!!!Wallet you are trying to restore already exists.',
    description: '"Wallet you are trying to restore already exists." error message.'
  },
  reportRequestError: {
    id: 'api.errors.ReportRequestError',
    defaultMessage: '!!!There was a problem sending the support request.',
    description: '"There was a problem sending the support request." error message'
  },
  unusedAddressesError: {
    id: 'api.errors.unusedAddressesError',
    defaultMessage: '!!!You cannot generate more than 20 consecutive unused addresses.',
    description: '"User cannot generate more unused addresses" error message'
  },
});

export class GenericApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.genericApiError.id,
      defaultMessage: messages.genericApiError.defaultMessage,
    });
  }
}

export class IncorrectWalletPasswordError extends LocalizableError {
  constructor() {
    super({
      id: messages.incorrectWalletPasswordError.id,
      defaultMessage: messages.incorrectWalletPasswordError.defaultMessage,
    });
  }
}

export class WalletAlreadyRestoredError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyRestoredError.id,
      defaultMessage: messages.walletAlreadyRestoredError.defaultMessage,
    });
  }
}

export class ReportRequestError extends LocalizableError {
  constructor() {
    super({
      id: messages.reportRequestError.id,
      defaultMessage: messages.reportRequestError.defaultMessage,
    });
  }
}

export class UnusedAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.unusedAddressesError.id,
      defaultMessage: messages.unusedAddressesError.defaultMessage,
    });
  }
}

export type CreateTransactionResponse = Array<void>;
export type CreateWalletResponse = Wallet;
export type DeleteWalletResponse = boolean;
export type GetLocalTimeDifferenceResponse = number;
export type GetWalletsResponse = Array<Wallet>;
export type GetWalletRecoveryPhraseResponse = Array<string>;
export type RestoreWalletResponse = Wallet;
export type UpdateWalletResponse = Wallet;
export type UpdateWalletPasswordResponse = boolean;

export type CreateWalletRequest = {
  name: string,
  mnemonic: string,
  password: string,
};

export type UpdateWalletPasswordRequest = {
  walletId: string,
  oldPassword: string,
  newPassword: string,
};

export type DeleteWalletRequest = {
  walletId: string,
};

export type RestoreWalletRequest = {
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
};

export type GetSyncProgressResponse = {
  localDifficulty: ?number,
  networkDifficulty: ?number,
};

export type GetTransactionsRequest = {
  walletId: string,
  skip: number,
  limit: number,
};

export type GetTransactionsResponse = {
  transactions: Array<WalletTransaction>,
  total: number,
};

export type RefreshPendingTransactionsResponse = Array<WalletTransaction>;


export type GetBalanceResponse = BigNumber;

export type SendBugReportRequest = {
  email: string,
  subject: string,
  problem: string,
  logs: Array<string>,
};
export type SendBugReportResponse = any;
