export const presaleAbi = [
  { type:'function', name:'buyWithETH', stateMutability:'payable', inputs:[], outputs:[] },
  { type:'function', name:'buyWithUSDC', stateMutability:'nonpayable', inputs:[{name:'amount',type:'uint256'}], outputs:[] },
  { type: 'function', name: 'buyWithEURC', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },

  // Optional reads (rename to match your contract if different)
  { type:'function', name:'getPricePerToken', stateMutability:'view', inputs:[], outputs:[{type:'uint256'}] },
  { type:'function', name:'getPresaleStatus', stateMutability:'view', inputs:[], outputs:[
    { name:'_saleActive', type:'bool' },
    { name:'_phaseCap',   type:'uint256' },
    { name:'_phaseSold',  type:'uint256' }
  ]},
] as const