/** @param {NS} ns **/
export async function main(ns) {
	var target =ns.args[0];//目标主机
	var script = "hack_3.js"; 

	var host = ns.getHostname(); 

	var serverMoney = ns.getServerMaxMoney(target) * 0.75;//让金钱处于最大值的75%
	var serverTresh = ns.getServerMinSecurityLevel(target) + 5;//降低到最小安保等级
 
	var scriptRam = ns.getScriptRam(script);

	//把目标机的RAM吃光
	var ownRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
	var thread = Math.floor(ownRam / scriptRam);

	if(thread == 0)
	{
		ns.tprintf("**********  error *********: 可用thread=%s , ownRam=%s,scriptCost=%s",thread,ownRam,scriptRam);
		return;
	}

	ns.tprintf(" *************  hack 脚本成功在 %s 中执行，攻击目标为: %s ,即将启用hack.js,t=%s",host,target,thread); 

	//在本机执行hack ,对目标机进行骇入(可以是自己)
	ns.spawn(script,thread,target,serverMoney,serverTresh);

}