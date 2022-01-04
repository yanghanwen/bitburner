function money(ns)
{
	return ns.getServerMoneyAvailable('home');
}

/** @param {NS} ns **/
export async function main(ns) {
	//自动购买升级骇客节点
	
	//购买倍率
	var lvStep = 1;
	var ramStep = 1;
	var coreStep =1;

	//当前骇客节点数量
	var cnt = ns.hacknet.numNodes();
 
	while(true){

		await ns.sleep(300);

		for(var i=0;i<cnt;++i)
		{ 
			var levelUpCost = ns.hacknet.getLevelUpgradeCost(i,lvStep);
			var ramUpCost = ns.hacknet.getRamUpgradeCost(i,ramStep);
			var coreUpCost = ns.hacknet.getCoreUpgradeCost(i,coreStep);
			var nodeCost = ns.hacknet.getPurchaseNodeCost();

			//new node
			if(cnt< ns.getPurchasedServerLimit()){ 
				//ns.tprintf("money=%s cost=%s",money(ns),nodeCost);
				if(money(ns) > nodeCost)
				{
					ns.hacknet.purchaseNode();
					cnt+=1;
				}
				else if(money(ns) >nodeCost * 0.1)
				{
					//马上就可以买了
					continue;
				}
			}
 
			if(money(ns)>levelUpCost)
			{
				ns.hacknet.upgradeLevel(i,lvStep);
			}
			if(money(ns)>ramUpCost)
			{
				ns.hacknet.upgradeRam(i,ramStep);
			}
			if(money(ns)>coreUpCost)
			{
				ns.hacknet.upgradeCore(i,coreStep);
			}
		}
	}
}
