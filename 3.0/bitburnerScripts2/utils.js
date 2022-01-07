/** @param {NS} ns **/
export async function main(ns) {
	
}

/** 
 * @param {NS} ns 
 * 打印购买服务器的价格
 * **/
export function printServerCost(ns)
{
	//最多只能买 2^20 = 1048576 的RAM
	for(var i =0;i<20;++i)
	{
		var ram = Math.pow(2,i);
		var cost = ns.getPurchasedServerCost(ram);
		ns.tprintf("RAM=%s ost=%s",ram,cost);
	}
} 

/** 
 * @param {NS} ns 
 * 递归 scan
 * **/
export function scan(ns)
{
	var host = ns.getHostname();
	var open = [];
	open.push(host);
	var close = [];

	var result = [];
	
	// //忽略自己的服务器
	// var serverList = ns.getPurchasedServers();
	// for(var i in serverList)
	// {
	// 	close.push(serverList[i]);
	// }

	while(open.length>0)
	{
		var node = open.pop();
		if(close.includes(node))
		{
			continue;
		}
		close.push(node);
		
		var neighbor = ns.scan(node);
		for(var i in neighbor)
		{
			var temp = neighbor[i]; 
			open.push(temp);
			result.push(temp);
		}
	} 

	return result;
}

/** 
 * @param {NS} ns  
 * 收益分析
 * **/
export function analyze(ns)
{	
	if(ns.args.length<=0)
	{
		ns.tprintf("analyze失败，参数未填");
	}

	var target = ns.args[0];
	var core = 1;

	// var maxNode = "";
	// var maxPow = -1; 
	// var all = scan(ns);
	// for(var i in all)
	// { 
	// 	var target = all[i];
	// 	var onceMoney = ns.hackAnalyze(target); 
	// 	var hackProb = ns.hackAnalyzeChance(target); 
	// 	var hackTime = ns.getHackTime(target);

	// 	//收益权重
	// 	var hackPow = onceMoney * hackProb / hackTime;
	// 	if(hackPow>maxPow)
	// 	{
	// 		maxNode = target;
	// 		maxPow = hackPow;
	// 	} 
	// }

	var server = ns.getServer(target);
	var powMoney = ns.hackAnalyze(target); 
	var powHackProb = ns.hackAnalyzeChance(target); 
	var powHackTime = ns.getHackTime(target);

	var data = "\n";
	data += "\n";
	data += "target="+target+"\n";
	data += "单次获得金钱（比例）:"+powMoney +" \n";
	data += "骇入概率（比例）:"+powHackProb + " \n";
	data += "骇入用时:"+powHackTime + " 毫秒;\n";
	data += "可用金钱:"+server.moneyAvailable.toString()+";\n"; 
	data += "最大金钱:"+server.moneyMax+";\n";  
	var safeLvBase = ns.getServerSecurityLevel(target);
	var safeLvMin=ns.getServerMinSecurityLevel(target);
	var safeLvNow=ns.getServerSecurityLevel(target);
	var safeLvNow2Min = safeLvNow - safeLvMin;
	data += "基本安保等级:"+safeLvBase+"\n";
	data += "最小安保等级(为基本的1/3):"+safeLvMin+"\n";
	data += "当前安保等级:"+safeLvNow+"\n"; 
	data += "当前骇入难度:"+server.hackDifficulty+"\n"; 

	//hack
	var money = Math.min(server.moneyAvailable,server.moneyMax)
	var hackThread = ns.hackAnalyzeThreads(target,money);
	var hackThread_max = ns.hackAnalyzeThreads(target,server.moneyMax);
	data += "一次性骇光 "+money+" 需要 "+hackThread+" 线程调用hack()\n"; 
	data += "一次性骇光 "+server.moneyMax+" 需要 "+hackThread_max+" 线程调用hack()\n";  

	//grow
	var money_now2max = server.moneyMax-server.moneyAvailable;
	if(money_now2max>0){
		var growThread = ns.growthAnalyze(target,money_now2max,core);
		data += "一次性拉满资源 "+money_now2max+" 需要线程:"+growThread+"\n"; 
	}
	else
	{
		data += "资源已满\n";  
	}

	//weaken
	var w = ns.weakenAnalyze(1,core);
	var w1000 = ns.weakenAnalyze(1000,core);
	data += "weaken 1线程效果 "+w+"\n"; 
	data += "weaken 1000线程效果 "+w1000+"\n";  
	var safeThread = Math.ceil( safeLvNow2Min/w);
	data += "降低安全等级 "+safeLvNow2Min+" 需要线程:"+safeThread+"\n";


	data += "getActionMaxLevel:"+server.getActionMaxLevel+"\n"; 
	data += "serverGrowth:"+server.serverGrowth+"\n"; 

	// if(ns.fileExists('Formulas.exe'))
	// {
	// 	data += "growPercent:"+ns.formulas.hacking.growPercent(server,1,ns.getPlayer(),1)+";\n"; 
	// }
	data += "\n"; 
	ns.tprint(data);  
}

/** 
 * @param {NS} ns  
 * 获得潜在价值最高的用户
 * **/ 
export function getCustomer(ns,except)
{
	var all = scan(ns);
	var max = 0;
	var result = "";
	for(var i in all)
	{
		var target = all[i];
		if(except.includes(target))
		{
			continue;
		}
		var money = ns.getServerMaxMoney(target);
		if(money>max)
		{
			max = money;
			result = target;
		}
	}
	return result;
}