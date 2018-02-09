// @flow

import { put, select, takeEvery } from 'redux-saga/effects'

import { fileSaver, gtm, keystore } from 'services'

import * as BACKUP_KEYSTORE from '../modules/modals/backupKeystore'
import { selectBackupKeystoreModalData } from './stateSelectors'
import { KEYSTORE_OPEN_MODAL, KEYSTORE_BACKUP } from '../modules/keystore'

function* onBackupKeystore(action: { password: Password }): Saga<void> {
  if (!action.password) {
    return
  }

  try {
    fileSaver.saveJSON(keystore.getDecryptedAccounts(action.password), 'jwallet-keystore-backup')
    yield onBackupKeystoreSuccess()
  } catch (err) {
    yield onBackupKeystoreFail()
  }
}

function* onBackupKeystoreSuccess() {
  gtm.pushBackupKeystore('Success')
  yield put({ type: BACKUP_KEYSTORE.CLOSE_MODAL })
}

function* onBackupKeystoreFail() {
  yield put({
    type: BACKUP_KEYSTORE.SET_INVALID_FIELD,
    fieldName: 'password',
    message: i18n('modals.backupKeystore.error.password.invalid'),
  })
}

function onOpenBackupKeystoreModal(): Saga<void> {
  gtm.pushBackupKeystore('Open')
}

function* onCloseBackupKeystoreModal(): Saga<void> {
  const { isOpenedFromKeystoreModal } = yield select(selectBackupKeystoreModalData)

  if (isOpenedFromKeystoreModal) {
    yield put({ type: KEYSTORE_OPEN_MODAL })
  }
}

export function* watchBackupKeystore(): Saga<void> {
  yield takeEvery(KEYSTORE_BACKUP, onBackupKeystore)
}

export function* watchOpenBackupKeystoreModal(): Saga<void> {
  yield takeEvery(BACKUP_KEYSTORE.OPEN_MODAL, onOpenBackupKeystoreModal)
}

export function* watchCloseBackupKeystoreModal(): Saga<void> {
  yield takeEvery(BACKUP_KEYSTORE.CLOSE_MODAL, onCloseBackupKeystoreModal)
}
