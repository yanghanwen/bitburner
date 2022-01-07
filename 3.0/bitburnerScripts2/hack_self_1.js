/** 
 * @param {NS} ns 
 *  1.需要保证拥有ROOT权限
 *  2.需要保证目标机RAM是空的
 * **/
export async function main(ns) {
	var host = ns.getHostname();//自身（有可能和目标是同一个）
	var target = host;//ns.args[0];//目标主机

	var serverMoney = ns.getServerMaxMoney(target) * 0.75;//让金钱处于最大值的75%
	var serverTresh = ns.getServerMinSecurityLevel(target) + 5;//降低到最小安保等级
 
	var ramCost = ns.getScriptRam('hack_3.js');

	//把目标机的RAM吃光
	var ownRam = ns.getServerMaxRam(host);
	var thread = Math.floor(ownRam/ramCost);
 
	ns.tprintf(" *************  hack 脚本成功在 %s 中执行",ns.getHostname(),target);
	
	//在本机执行hack2.js ,对目标机进行骇入(可以是自己)
	await ns.spawn('hack_3.js',thread,target,serverMoney,serverTresh);

}