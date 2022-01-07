/** @param {NS} ns **/
export async function main(ns) {
	//参数准备
	var host = ns.getHostname();
	var target  = ns.args[0]; 
	var maxMoney = ns.getServerMaxMoney(target);
	var availableMoney = ns.getServerMoneyAvailable(target);
	
	//计算
	var hackMaxMoneyThread = ns.hackAnalyzeThreads(target,availableMoney);  
	hackMaxMoneyThread = Math.floor(hackMaxMoneyThread);

	var maxRam = ns.getServerMaxRam(host);
	var usedRam = ns.getServerUsedRam(host);
	var freeRam = maxRam - usedRam;
	var ramForHack = ns.getScriptRam('hack.js');
	var useableThread = Math.floor(freeRam/ramForHack);

	var thread = Math.min(hackMaxMoneyThread,useableThread);
 
	ns.tprint("hack开始, 目标当前:金钱",availableMoney," , 最大收益线程:",hackMaxMoneyThread,",可用线程:",useableThread,",启用线程:%s",thread);

	var pid = ns.run('hack.js',thread,target);
	if(pid==0)
	{ 
		ns.tprintf("启动失败");
	}
	 
}