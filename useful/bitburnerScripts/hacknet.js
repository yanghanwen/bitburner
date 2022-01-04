/** @param {NS} ns **/
export async function main(ns) {
	//自动购买升级骇客节点
	
	//购买倍率
	var lvStep = 5;
	var ramStep = 1;
	var coreStep =1;

	//当前骇客节点数量
	var cnt = ns.hacknet.numNodes();

	while(true){
		for(var i=0;i<cnt;++i)
		{ 
			var levelUpCost = ns.hacknet.getLevelUpgradeCost(i,lvStep);
			var ramUpCost = ns.hacknet.getRamUpgradeCost(i,ramStep);
			var coreUpCost = ns.hacknet.getCoreUpgradeCost(i,coreStep);

			if(cnt< ns.getPurchasedServerLimit()){
				//取出三种升级的最小值，当购买新节点只用花费很少一部分钱时，买一个新的节点
				var minCost = Math.min(levelUpCost,ramUpCost,coreUpCost);
				var newCost = ns.hacknet.getPurchaseNodeCost();
				if(newCost<minCost * 5 && ns.getServerMoneyAvailable('home')>newCost)
				{
					ns.hacknet.purchaseNode();
					cnt+=1;
				}
			}
 
			if(ns.getServerMoneyAvailable('home')>levelUpCost)
			{
				ns.hacknet.upgradeLevel(i,lvStep);
			}
			if(ns.getServerMoneyAvailable('home')>ramUpCost)
			{
				ns.hacknet.upgradeRam(i,ramStep);
			}
			if(ns.getServerMoneyAvailable('home')>coreUpCost)
			{
				ns.hacknet.upgradeCore(i,coreStep);
			}
		}
		await ns.sleep(300);
	}
}