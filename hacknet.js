import * as scan from 'utils/scan.js'

/** @param {NS} ns **/
export async function main(ns) { 

	//目前并没有精细地计算，只是保证一个基本的升级流程
	while(true)
	{
		var allNodeCount = ns.hacknet.numNodes();
		for (var i = 0 ;i<allNodeCount;++i)
		{ 
			//RAM超高收益，拉满
			while(ns.hacknet.upgradeRam(i,1)); 

			//升级开销不高，拉满
			while(ns.hacknet.getNodeStats(i).level<200 && ns.hacknet.upgradeLevel(i,1)); 
			//前期8核就已经翻倍了，够用了
			while(ns.hacknet.getNodeStats(i).cores<8 && ns.hacknet.upgradeCore(i,1));  
		}

		await ns.sleep(1000);
	}
}