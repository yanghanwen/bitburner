let copyScript = '/utils/copy.js'
let analyzeScript = '/utils/analyze.js'
let loopBatchScript = '/utils/loop_batch.js'
let growScript = '/base/grow.js'
let hackScript = '/base/hack.js'
let weakenScript = '/base/weaken.js'
let script = '/utils/deploy.js'

/**  
 * 注意：该脚本需要在家庭主机上调用、并且持续占用RAM进行流程控制
 * 		将三大脚本部署到目标服务器
 * 		并且使用其RAM定期运行三大函数 
 * @param {NS} ns 
 * @param arg0 = server 
 * **/
export async function main(ns) 
{ 
	if(ns.args.length < 2)
	{
		ns.tprintf("args error");
		return;
	}
	
	var home = 'home';
	var server = ns.args[0];//因为在家庭主机调用，你需要指明服务器
	var target = ns.args[1];//你需要指明攻击目标

	//------------- 	检查是否因为各种原因传入了奇怪的参数
	if( server == home || target == home )
	{
		ns.print('args is home');
		return;
	}

	var maxMoney = ns.getServerMaxMoney(target);
	if(maxMoney==0)
	{
		ns.print("max money == 0");//可能是自己的服务器
		return;
	}

	//------------- 	参数准备
	var minSecurityLevel = ns.getServerMinSecurityLevel(target);
	var minSecurityLevelCompare = minSecurityLevel + 5;
	var selfCost = ns.getScriptRam(script);
	var serverMaxRAM = ns.getServerMaxRam(server);//通常来说被骇主机的RAM是恒定的；

	//如果可用RAM并没有比这个脚本高很多，那么这台机器的价值并不高
	if(serverMaxRAM < 16)
	{
		ns.print("可用RAM太少，忽略"); 
		return;
	}

	var _availableRAM = ()=>
	{
		return serverMaxRAM - ns.getServerUsedRam(server) - selfCost - 1 ;
	};

	//------------- 	在目标机拷贝必要文件
	ns.exec(copyScript,home,1,server); 
	await ns.sleep(1000); 
 
	ns.tprintf("[%s] -> [%s] 开始执行循环",server,target); 
	//------------- 	在目标机运行三大函数
	while(true)
	{ 
		var callScript = "";
		//var delay = 0;
		if(ns.getServerSecurityLevel(target) > minSecurityLevelCompare)
		{
			callScript = weakenScript;
			//delay = ns.getWeakenTime(server);
		}
		else if(ns.getServerMoneyAvailable(target) < maxMoney * 0.75)
		{
			callScript = growScript;
			//delay = ns.getGrowTime(server);
		}
		else
		{
			callScript = hackScript;
			//delay = ns.getHackTime(server);
		}

		var availableRAM = _availableRAM();
		var scriptCost = ns.getScriptRam(callScript);
		var t = Math.floor(availableRAM/scriptCost);

		if(t > 0)
		{
			var pid = ns.exec(callScript,server,t,target);
			if(pid != 0)
			{
				//walt for script end
				await ns.sleep(500);
				while(true)
				{
					if(!ns.isRunning(callScript,server,target))
					{
						break;
					}
					await ns.sleep(500);
				}
				//await ns.sleep(delay);
			}
		} 
		await ns.sleep(500);
	}
	//run
	//你如果让服务器每台都单独去解析，这样会引起很难处理的并发问题
	// ns.exec(analyzeScript,server,1); 
}