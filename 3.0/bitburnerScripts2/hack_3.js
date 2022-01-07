/** 
 * @param {NS} ns 
 * 以指定的参数运行三大函数
 * **/
export async function main(ns) { 

	var target = ns.args[0];
	var serverMoney = ns.args[1];
	var serverTresh = ns.args[2];  

	ns.tprintf("开始对 %s 执行 hack() weaken() grow() , 保证资金>%s , 保证安保等级<%s",target,serverMoney,serverTresh)

	while(true)
	{
		if(ns.getServerSecurityLevel(target)>serverTresh)
		{
			await ns.weaken(target); 
		}
		else if(ns.getServerMoneyAvailable(target)<serverMoney)
		{ 
			await ns.grow(target);
		}
		else
		{
			await ns.hack(target);
		}
	}
}