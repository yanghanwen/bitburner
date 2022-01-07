/** @param {NS} ns **/
export async function main(ns) { 
	var target = ns.args[0]; 
	ns.tprintf("运行hack脚本,目标:%s",target);

	while(true)
	{ 
	 	await ns.grow(target); 
	 	await ns.weaken(target); 
	 	await ns.hack(target); 
	}
}