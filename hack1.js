/** @param {NS} ns **/
export async function main(ns) {
	var target =ns.args[0];//目标主机

	var serverMoney = ns.getServerMaxMoney(target) * 0.75;
	var serverTresh = ns.getServerMinSecurityLevel(target) + 5;

	ns.tprintf("hack脚本在 %s 中执行，攻击目标为: %s",ns.getHostname(),target);

	//骇端口
	if(ns.fileExists("BruteSSH.exe","home"))
	{
		ns.brutessh(target); 
	}

	//骇入
	ns.nuke(target);

	var ramCost = ns.getScriptRam(ns.getScriptName());
	//把目标机的RAM吃光
	var ownRam = ns.getServerMaxRam(target);
	var thread = Math.floor(ownRam/ramCost);

	while(true)
	{
		if(ns.getServerSecurityLevel(target)>serverTresh)
		{
			await ns.weaken(target,thread); 
		}
		else if(ns.getServerMoneyAvailable(target)<serverMoney)
		{ 
			await ns.grow(target,thread);
		}
		else
		{
			await ns.hack(target,thread);
		}
	}
}
