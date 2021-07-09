import { beforeSelectTaskType, afterSelectTaskType } from './1-select-type'
import { afterSelectTaskTarget } from './2-select-target'
import { afterInputTitle } from './3-input-title'
import { afterInputDescription } from './4-input-description'
import { afterUploadDocument, afterUploadPhoto, afterEndUpload } from './5-upload-details'
import { afterInputMembersAmount, afterSkipMembersAmount } from './6-input-members-amount'
import { afterSelectLocation, afterInputTemplateLocation } from './6-select-locations'
import { confirmNewTask } from './7-confirm'
import { saveNewTask } from './8-save'

export {
  beforeSelectTaskType,
  afterSelectTaskType,
  afterSelectTaskTarget,
  afterInputTitle,
  afterInputDescription,
  afterUploadDocument, afterUploadPhoto, afterEndUpload,
  afterInputMembersAmount, afterSkipMembersAmount,
  afterSelectLocation, afterInputTemplateLocation,
  confirmNewTask,
  saveNewTask,
}
