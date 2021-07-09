import { showMenu, updateMenu } from './menu'
import { toogleForceLocking } from './commands/toogle-force-locking'
import { toogleEmergencyUnlocking } from './commands/toogle-emergency-unlocking'
import { beforeInputPassword, afterInputPassword } from './commands/update-lock-password'
import { lockAccount } from './commands/lock-account'

export {
  showMenu,
  updateMenu,

  toogleForceLocking,
  toogleEmergencyUnlocking,
  beforeInputPassword, afterInputPassword,
  lockAccount,
}
