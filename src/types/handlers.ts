import { initialHandler, TelegramHandlers } from '@jace1995/telegram-handler'

import { Api } from './api'
import { User } from '../types/models'
import { Action } from './actions'

import { start } from '../handlers/guest/start'
import { tasks } from '../handlers/guest/tasks'
import { info } from '../handlers/guest/info'
import * as menu from '../handlers/guest/menu'

import { communityInfo } from '../handlers/member/community-info'
import * as editCommunityInfo from '../handlers/leader/edit-community-info'
import * as securitySettings from '../handlers/guest/security-settings'

import * as createCommunity from '../handlers/guest/create-community'
import * as joinUnion from '../handlers/guest/join-community'
import * as leaveCommunity from '../handlers/member/leave-community'

import * as manageRole from '../handlers/leader/manage-role'
import * as appointVerified from '../handlers/activist/appoint-verified'
import * as updateRole from '../handlers/activist/update-role'
import * as createTask from '../handlers/leader/create-task'
import * as alliance from '../handlers/leader/alliance'
import * as allies from '../handlers/leader/allies/index'
import * as leaderList from '../handlers/leader/manage-leaders'

import * as manageTask from '../handlers/leader/manage-task'
import * as manageLocations from '../handlers/leader/manage-locations'
import * as resetRoles from '../handlers/leader/reset-roles'
import * as excludeAll from '../handlers/leader/exclude-all'
import { membersMenu } from '../handlers/leader/members-menu'

import * as task from '../handlers/member/task'

export const handlers: Partial<TelegramHandlers<Api, User>> = {
  text: {
    [Action.update_lock_password]: initialHandler(securitySettings.afterInputPassword),

    [Action.create_community_input_name]: createCommunity.afterInputName,
    [Action.create_community_input_description]: createCommunity.afterInputDescription,

    [Action.create_task_input_title]: createTask.afterInputTitle,
    [Action.create_task_input_description]: createTask.afterInputDescription,
    [Action.create_task_input_members_amount]: createTask.afterInputMembersAmount,
    [Action.create_task_create_temp_location]: createTask.afterInputTemplateLocation,

    [Action.join_community_input_id]: joinUnion.afterInputUnionId,
    
    [Action.update_role_input_members]: updateRole.afterInputMembers,

    [Action.input_location_name]: manageLocations.create.afterInputName,
    [Action.save_location]: manageLocations.afterInputLocations,

    [Action.edit_community_input_name]: editCommunityInfo.afterInputName,
    [Action.edit_community_input_description]: editCommunityInfo.afterInputDescription,

    [Action.alliance_join_after_input_id]: alliance.join.afterInputAllianceId,
    [Action.add_ally_after_input_id]: allies.addAlly.afterInputAllyId,

    [Action.add_leader_after_input_id]: leaderList.addLeader.afterInputLeaderId,
    [Action.remove_leader_after_input_id]: leaderList.removeLeader.afterInputLeaderId,

    [Action.alliance_join_after_input_id]: initialHandler(alliance.join.afterInputAllianceId),
    [Action.accept_task_create_temp_location]: manageTask.request.afterInputTemplateLocation,
  },
  command: {
    [Action.start]: start,
    [Action.menu]: menu.showMenu,
    [Action.tasks]: tasks,
    [Action.info]: info,
  },
  button: {
    // navigation
    [Action.menu_community_selected]: initialHandler(menu.afterCommunitySelected),

    // security
    [Action.security_settings]: initialHandler(securitySettings.showMenu),
    [Action.toogle_force_locking]: initialHandler(securitySettings.toogleForceLocking),
    [Action.toogle_emergency_unlocking]: initialHandler(securitySettings.toogleEmergencyUnlocking),
    [Action.input_lock_password]: initialHandler(securitySettings.beforeInputPassword),
    [Action.lock_account]: initialHandler(securitySettings.lockAccount),

    // create community
    [Action.create_community]: initialHandler(createCommunity.beforeSelectType),
    [Action.create_community_select_type]: createCommunity.afterSelectType,
    [Action.create_community_input_description]: createCommunity.afterInputDescriptionSkip,
    [Action.create_community_upload_image]: createCommunity.afterUploadImageSkip,

    // create task
    [Action.create_task]: initialHandler(createTask.beforeSelectTaskType),
    [Action.create_task_select_type]: createTask.afterSelectTaskType,
    [Action.create_task_select_target]: createTask.afterSelectTaskTarget,
    [Action.create_task_upload_details]: createTask.afterEndUpload,
    [Action.create_task_input_members_amount]: createTask.afterSkipMembersAmount,
    [Action.create_task_select_location]: createTask.afterSelectLocation,
    [Action.create_task_confirm]: createTask.confirmNewTask,
    [Action.create_task_save]: createTask.saveNewTask,

    // join community
    [Action.join_community]: initialHandler(joinUnion.beforeInputUnionId),
    [Action.join_community_confirm]: initialHandler(joinUnion.afterConfirmJoin),

    // leave community
    [Action.leave_community]: initialHandler(leaveCommunity.leave),
    [Action.confirm_leave_community]: initialHandler(leaveCommunity.afterConfirm),

    // manage role
    [Action.manage_role]: initialHandler(manageRole.beforeSelectRole),
    [Action.appoint_verified]: initialHandler(appointVerified.appointVerified),
    [Action.manage_role_select_role]: manageRole.afterSelectRole,

    // locations
    [Action.locations_list]: initialHandler(manageLocations.locationsList),
    [Action.location_info]: initialHandler(manageLocations.locationInfo),
    [Action.create_location]: initialHandler(manageLocations.create.beforeInputName),
    [Action.update_location]: initialHandler(manageLocations.updateLocation),
    [Action.delete_location]: initialHandler(manageLocations.deleteLocation),

    // community info
    [Action.community_info]: initialHandler(communityInfo),

    // members
    [Action.reset_roles]: initialHandler(resetRoles.beforeConfirm),
    [Action.confirm_reset_roles]: initialHandler(resetRoles.afterConfirm),
    [Action.exclude_all]: initialHandler(excludeAll.beforeConfirm),
    [Action.confirm_exclude_all]: initialHandler(excludeAll.afterConfirm),
    [Action.members]: initialHandler(membersMenu),

    // edit community info
    [Action.edit_community]: initialHandler(editCommunityInfo.communityMenu),
    [Action.edit_community_name]: initialHandler(editCommunityInfo.beforeInputName),
    [Action.edit_community_description]: initialHandler(editCommunityInfo.beforeInputDescription),
    [Action.edit_community_image]: initialHandler(editCommunityInfo.beforeUploadImage),
    [Action.edit_community_input_description]: initialHandler(editCommunityInfo.afterDeleteDescription),
    [Action.edit_community_upload_image]: initialHandler(editCommunityInfo.afterDeleteImage),

    // tasks
    [Action.active_tasks]: initialHandler(task.activeTasks),
    [Action.task_info]: initialHandler(task.info),
    [Action.task_apply_info]: initialHandler(task.infoApply),
    [Action.update_task_message]: initialHandler(task.beforeUpdateTaskInfo),
    [Action.task_stats]: initialHandler(manageTask.statistics),
    [Action.close_task]: initialHandler(manageTask.closeTask),
    [Action.open_task]: initialHandler(manageTask.openTask),
    [Action.call_waiting_members]: initialHandler(manageTask.callWaitingMembers),
    [Action.remind_confirm]: initialHandler(manageTask.remindParticipationConfirm),
    // single
    [Action.single_task_cancel]: initialHandler(task.single.cancel),
    [Action.single_task_wait]: initialHandler(task.single.wait),
    [Action.single_task_doing]: initialHandler(task.single.doing),
    [Action.single_task_done]: initialHandler(task.single.done),
    [Action.single_task_confirm_done]: initialHandler(task.single.confirmDone),
    // individual
    [Action.individual_task_cancel]: initialHandler(task.individual.cancel),
    [Action.individual_task_doing]: initialHandler(task.individual.doing),
    [Action.individual_task_done]: initialHandler(task.individual.done),
    // location
    [Action.location_task_select ]: initialHandler(task.location.selectLocation),

    // alliances
    [Action.alliances]: initialHandler(alliance.list.beforeSelectOption),
    // join alliance
    [Action.alliance_join]: initialHandler(alliance.join.beforeInputAllianceId),
    [Action.alliance_join_confirm]: alliance.join.afterConfirmJoinAlliance,
    // leave alliance
    [Action.alliance_leave_select_id]: initialHandler(alliance.leave.beforeSelectAllianceToLeave),
    [Action.alliance_leave]: initialHandler(alliance.leave.afterSelectAllianceToLeave),
    // cancel invite alliance
    [Action.alliance_cancel_invite_select]: initialHandler(alliance.cancelInvite.beforeSelectInvite),
    [Action.alliance_cancel_invitation]: initialHandler(alliance.cancelInvite.afterSelectInvite),
    
    // allies
    [Action.allies_list]: initialHandler(allies.beforeSelectOption),
    [Action.allies_stats]: initialHandler(allies.statistics),
    // add ally
    [Action.add_ally]: initialHandler(allies.addAlly.beforeInputAllyId),
    [Action.add_ally_save]: initialHandler(allies.addAlly.afterConfirmSaveToAllies),
    // remove ally
    [Action.remove_ally]: initialHandler(allies.removeAlly.beforeSelectAllyId),
    [Action.remove_ally_save]: allies.removeAlly.afterSelectAllyId,
    // cancel invite ally
    [Action.allies_cancel_invite]: initialHandler(allies.cancelInvite.beforeSelectInvite),
    [Action.allies_cancel_invite_save]: initialHandler(allies.cancelInvite.afterSelectInvite),
    // 
    [Action.select_ally]: initialHandler(allies.info.beforeSelectAlly),
    [Action.ally_info]: initialHandler(allies.info.afterSelectAlly),

    // leader list
    [Action.leaders_menu]: initialHandler(leaderList.menu),
    [Action.add_leader]: initialHandler(leaderList.addLeader.beforeInputLeaderId),
    [Action.remove_leader]: initialHandler(leaderList.removeLeader.beforeInputLeaderId),

    // leader manage task
    [Action.forward_task]: initialHandler(manageTask.forward.selectRecipients),
    [Action.forward_task_select]: manageTask.forward.updateSelection,
    [Action.forward_task_choice_variant]: manageTask.forward.afterSelectVariant,
    [Action.accept_task]: initialHandler(manageTask.request.acceptTask),
    [Action.accept_task_select_location]: manageTask.request.afterSelectLocation,
    [Action.decline_task]: initialHandler(manageTask.request.declineTask),
  },
  photo: {
    [Action.create_community_upload_image]: createCommunity.afterUploadImage,
    [Action.edit_community_upload_image]: editCommunityInfo.afterUploadImage,
    [Action.create_task_upload_details]: createTask.afterUploadPhoto,
  },
  document: {
    [Action.create_task_upload_details]: createTask.afterUploadDocument,
  }
}
