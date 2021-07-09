import { Action } from './actions'
import { AuthPayload } from '../helpers/user'

import { JoinUnionPayload } from '../handlers/guest/join-community/2-confirm'

import { InputNamePayload } from '../handlers/guest/create-community/2-input-name'
import { InputDescriptionPayload } from '../handlers/guest/create-community/3-input-description'
import { UploadImagePayload } from '../handlers/guest/create-community/4-upload-image'

import { SelectTaskTargetPayload } from '../handlers/leader/create-task/2-select-target'
import { ManageLocationsPayload } from '../handlers/leader/manage-locations/locations-list'
import { JoinAllianceProps } from '../handlers/leader/alliance/join-alliance/2-confirm'
import { InputTaskTitlePayload } from '../handlers/leader/create-task/3-input-title'
import { InputTaskDescriptionPayload } from '../handlers/leader/create-task/4-input-description'
import { UploadTaskDetailsPayload } from '../handlers/leader/create-task/5-upload-details'
import { InputMembersPayload } from '../handlers/activist/update-role'
import { AddAllyPayload } from '../handlers/leader/allies/add-ally/2-save-to-allies'
import { InputLocationPayload } from '../handlers/leader/manage-locations/input-locations'
import { LeaveAlliancePayload } from '../handlers/leader/alliance/leave-alliance'
import { CreateTaskPayload } from '../handlers/leader/create-task/8-save'
import { ForwardTaskPayload } from '../handlers/leader/manage-task/task-forward/types'
import { AttachTaskPayload } from '../handlers/leader/manage-task/task-request/attach-task'
import { ApplyAcceptTaskPayload } from '../handlers/leader/manage-task/task-request/accept-task/3-accept-task'

export interface ActionPayloadMap {
  [Action.join_community_confirm]: JoinUnionPayload
  
  [Action.create_community_input_name]: InputNamePayload
  [Action.create_community_input_description]: InputDescriptionPayload
  [Action.create_community_upload_image]: UploadImagePayload

  [Action.create_task_select_type]: AuthPayload
  [Action.create_task_select_target]: SelectTaskTargetPayload
  [Action.create_task_input_title]: InputTaskTitlePayload
  [Action.create_task_input_description]: InputTaskDescriptionPayload
  [Action.create_task_upload_details]: UploadTaskDetailsPayload
  [Action.create_task_input_members_amount]: CreateTaskPayload
  [Action.create_task_select_location]: CreateTaskPayload
  [Action.create_task_create_temp_location]: CreateTaskPayload
  [Action.create_task_confirm]: CreateTaskPayload
  [Action.create_task_save]: CreateTaskPayload

  [Action.edit_community_input_name]: AuthPayload
  [Action.edit_community_input_description]: AuthPayload
  [Action.edit_community_upload_image]: AuthPayload
  [Action.manage_role_select_role]: AuthPayload

  [Action.locations_list]: ManageLocationsPayload
  [Action.input_location_name]: AuthPayload
  [Action.save_location]: InputLocationPayload

  [Action.update_role_input_members]: InputMembersPayload

  [Action.alliance_join_after_input_id]: AuthPayload
  [Action.alliance_join_confirm]: JoinAllianceProps
  [Action.alliance_leave]: LeaveAlliancePayload

  [Action.add_ally_after_input_id]: AuthPayload
  [Action.add_ally_save]: AddAllyPayload
  [Action.remove_ally_save]: AuthPayload

  [Action.add_leader_after_input_id]: AuthPayload
  [Action.remove_leader_after_input_id]: AuthPayload

  [Action.forward_task_select]: ForwardTaskPayload
  [Action.forward_task_choice_variant]: ForwardTaskPayload
  [Action.attach_task_select]: AttachTaskPayload

  [Action.accept_task_select_location]: ApplyAcceptTaskPayload
  [Action.accept_task_create_temp_location]: ApplyAcceptTaskPayload
}
