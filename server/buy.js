let deploy = '/server/deploy.js'

/** 
 * @param {NS} ns   
 * **/
export async function main(ns) 
{
	let batchRAMCost = 540;//在其他地方算好一批调用的最大开销
	let target = "n00dles";//骇取目标，需要和RAMCos对应	

	//至少保证能调用一次最大开销的程度
	var purchaseRAM = getPow2(batchRAMCost);
	if(purchaseRAM==-1)
	{
		ns.print("购买失败 get ram fail , batchRAMCost = " + batchRAMCost );
		return;
	}
	var cost = ns.getPurchasedServerCost(purchaseRAM);
	var available = ns.getServerMoneyAvailable('home');
	if(available < cost)
	{
		ns.print("购买失败,"+available+"<"+cost);
		return;
	}

	var pServers = ns.getPurchasedServers();
	var nextIndex = pServers.length;
	var server = ns.purchaseServer( "pserv-" + nextIndex, purchaseRAM );
	if(server=="")
	{
		ns.print("购买失败, purchaseServer fail");
		return;
	}
	
	ns.print("购买成功, 即将开始部署服务器");
	
	ns.spawn(deploy,1,server);
}

function getPow2(behind)
{
	var value = 0;
	for(var i = 1 ; i < 20; ++i)
	{
		value = Math.pow(2,i);
		if(value>behind)
		{
			return value;
		}
	}
	return -1;
}