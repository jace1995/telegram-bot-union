export enum Action {
  // GUEST
  
  // main
  start = 'start',
  tasks = 'tasks',
  menu = 'menu',
  info = 'info',
  menu_community_selected = 'menu_community_selected',

  members = 'members',
  reset_roles = 'reset_roles',
  confirm_reset_roles = 'confirm_reset_roles',
  exclude_all = 'exclude_all',
  confirm_exclude_all = 'confirm_exclude_all',
  community_info = 'community_info',

  security_settings = 'security_settings',
  lock_account = 'lock_account',
  toogle_force_locking = 'toogle_force_locking',
  toogle_emergency_unlocking = 'toogle_emergency_unlocking',
  input_lock_password = 'input_lock_password',
  update_lock_password = 'update_lock_password',
  emergency_unlock = 'emergency_unlock',
  unlock_account = 'unlock_account',

  // create community
  create_community = 'create_community',
  create_community_select_type = 'create_community_select_type',
  create_community_input_name = 'create_community_input_name',
  create_community_input_description = 'create_community_input_description',
  create_community_upload_image = 'create_community_upload_image',

  // join community
  join_community = 'join_community',
  join_community_input_id = 'join_community_input_id',
  join_community_confirm = 'join_community_confirm',

  // leave community
  leave_community = 'leave_community',
  confirm_leave_community = 'confirm_leave_community',

  // manage role
  appoint_verified = 'appoint_verified',
  manage_role = 'manage_role',
  manage_role_select_role = 'manage_role_select_role',
  update_role_input_members = 'update_role_input_members',

  // alliance
  alliances = 'alliances',

  alliance_join = 'alliance_join',
  alliance_join_after_input_id = 'alliance_join_input_id',
  alliance_join_confirm = 'alliance_join_confirm',

  alliance_leave_select_id = 'alliance_leave_select_id',
  alliance_leave = 'alliance_leave',

  alliance_cancel_invite_select = 'alliance_cancel_invite_select',
  alliance_cancel_invitation = 'alliance_cancel_invitation',

  // allies list
  allies_list = 'allies_list',

  add_ally = 'add_ally_before_input_id',
  add_ally_after_input_id = 'add_ally_after_input_id',
  add_ally_save = 'add_ally_save',

  remove_ally = 'remove_ally',
  remove_ally_save = 'remove_ally_save',

  allies_cancel_invite = 'allies_cancel_invite',
  allies_cancel_invite_save = 'allies_cancel_invite_save',

  select_ally = 'select_ally',
  ally_info = 'ally_info',
  allies_stats = 'allies_stats',

  // leader list
  leaders_menu = 'leaders_menu',
  add_leader = 'add_leader',
  add_leader_after_input_id = 'add_leader_after_input_id',
  remove_leader = 'remove_leader',
  remove_leader_after_input_id = 'remove_leader_after_input_id',

  // manage locations
  locations_list = 'locations_list',
  location_info = 'location_info',
  create_location = 'create_location',
  input_location_name = 'input_location_name',
  update_location = 'update_location',
  save_location = 'save_location',
  delete_location = 'delete_location',

  // edit community info
  edit_community = 'edit_community',

  edit_community_name = 'edit_community_name',
  edit_community_description = 'edit_community_description',
  edit_community_image = 'edit_community_image',

  edit_community_input_name = 'edit_community_input_name',
  edit_community_input_description = 'edit_community_input_description',
  edit_community_upload_image = 'edit_community_upload_image',

  // create task
  create_task = 'create_task',
  create_task_select_type = 'create_task_select_type',
  create_task_select_target = 'create_task_select_target',
  create_task_input_title = 'create_task_input_title',
  create_task_input_description = 'create_task_input_description',
  create_task_upload_details = 'create_task_upload_details',
  
  create_task_input_members_amount = 'create_task_input_members_amount',
  create_task_select_location = 'create_task_select_location',
  create_task_create_temp_location = 'create_task_create_temp_location',

  create_task_confirm = 'create_task_confirm',
  create_task_save = 'create_task_save',
  
  // tasks
  active_tasks = 'active_tasks',

  // leader task actions
  update_task_message = 'update_task_message',
  task_info = 'task_info',
  task_apply_info = 'task_apply_info',
  close_task = 'close_task',
  open_task = 'open_task',
  task_stats = 'task_stats',
  forward_task = 'forward_task',
  forward_task_select = 'forward_task_select',
  forward_task_choice_variant = 'forward_task_choice_variant',
  call_waiting_members = 'call_waiting_members',
  remind_confirm = 'remind_confirm',

  // forward task admins alert menu
  forwarded_task_details = 'forwarded_task_details',
  accept_task = 'accept_task',
  accept_task_select_location = 'accept_task_select_location',
  accept_task_create_temp_location = 'accept_task_create_temp_location',
  attach_task = 'attach_task',
  attach_task_select = 'attach_task_select',
  decline_task = 'decline_task',

  // single
  single_task_cancel = 'single_task_cancel',
  single_task_wait = 'single_task_wait',
  single_task_doing = 'single_task_doing',
  single_task_done = 'single_task_done',
  single_task_confirm_done = 'single_task_confirm_done',
  // individual
  individual_task_cancel = 'individual_task_cancel',
  individual_task_doing = 'individual_task_doing',
  individual_task_done = 'individual_task_done',
  // location
  location_task_select  = 'location_task_select',
}
