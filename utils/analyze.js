//they all need on arg = 'target' 
let hackScript = '/base/hack.js'
let growScript = '/base/grow.js'
let weakenScript = '/base/weaken.js'
let selfScript = 'test.js'
let batchScript = '/utils/batch.js'
let loopBatchScript ='utils/loop_batch.js'

/** 
 * @param {NS} ns 
 * 解析某个目标机执行一个batch时的最佳调用比例
 * **/
export async function main(ns) 
{    
	//var scan = utils.scan(ns);
	//1.事实上前期的RAM数只够黑一些钱很少的机器
	//否则光是grow就要调用非常久
	//因此 analyze函数适用于找出真正合适的目标以后计算线程配比（因为算这个代价很大，要等很久，grow到一个完全状态会占用非常多时间）
	//并且如果一直grow，会使得目标安全等级一直变高，到后面grow会一直失败
	//而这部分的处理内容尚未完善…
	//而如果RAM数量不足以攒够非常高的hack比率，整体的性价比也不会特别高，不如去骇取低等级的主机
	//总结：前期无脑黑 n00dles 就行了
	  
	var bestTarget = "n00dles";
	var result = [];
	var suc = await analyze(ns,bestTarget,result); 
	if(suc)
	{
		var a = result['hack'];
		var b = result['weaken1'];
		var c = result['grow'];
		var d = result['weaken2'];
		ns.tprintf("n00dles thread = [%s] [%s] [%s] [%s]",a,b,c,d);  
 
		var rand = ns.getTimeSinceLastAug().toString(); 

		//执行循环脚本
		ns.spawn(loopBatchScript,1,bestTarget,a,b,c,d,rand);
	}
	else
	{
		ns.tprintf("fail call analyze");
	}
}  


/** 
 * @param {NS} ns 
 * @param 骇入目标
 * @param 忽略批次时间超过这个值的调用 
 * @param 返回执行结果 true/false
 * **/
async function analyze(ns,target,out)
{
	var ignoreTimeOver = 120000;//写死：忽略超过120秒的
	// read args
	var self = ns.getHostname();

	if(!ns.hasRootAccess(target))
	{
		ns.tprintf("目标 [%s] 无Root 权限",target);
		return false;
	} 

	// define 
	var core = 1;//TODO read from some where 

	//cost
	var hackCost = ns.getScriptRam(hackScript,self);
	var growCost = ns.getScriptRam(growScript,self);
	var weakenCost = ns.getScriptRam(weakenScript,self);
	var selfCost = ns.getScriptRam(selfScript);

	//other
	var selfAvaliableRam = ns.getServerMaxRam(self) - ns.getServerUsedRam(self) - selfCost; 
	
	//get func
	var _nowHackLevel = ()=> ns.getHackingLevel();
	var _hackCallTime = ()=> ns.getHackTime(target); 
	var _growCallTime = ()=> ns.getGrowTime(target);
	var _weakenCallTime = ()=> ns.getWeakenTime(target); 

	//如果到这里为止，预判定解析时间，如果长得太离谱的就忽略了
	//TODO:这里判定的是单次的处理时间，如果要把一个目标机维护到完善状态同样要花许多时间的话，也应该忽略
	var calculateEndTime = max([_hackCallTime(),_growCallTime(),_weakenCallTime()]);
	if(ignoreTimeOver > 0 && calculateEndTime > ignoreTimeOver)
	{
		ns.tprintf("目标[%s] hackTime=[%s] ,growTime=[%s],weakenTime=[%s], 解析时间[%s] > [%s] , 时间过长，忽略",
		target,_hackCallTime(),_growCallTime(),_weakenCallTime(),calculateEndTime,ignoreTimeOver
		);
		return false;
	}
	else
	{
		ns.tprintf("目标[%s] hackTime=[%s] ,growTime=[%s],weakenTime=[%s], 解析时间[%s] < [%s] ,开始处理",
		target,_hackCallTime(),_growCallTime(),_weakenCallTime(),calculateEndTime,ignoreTimeOver
		);
	}

	var _availableMoney = ()=> ns.getServerMoneyAvailable(target);
	var _maxMoney = ()=> ns.getServerMaxMoney(target);
	var _minSecurityLevel =  ()=> ns.getServerMinSecurityLevel(target);
	var _nowSecurityLevel =  ()=> ns.getServerSecurityLevel(target);
	var _getAvailableCall = (needCall,singleCost)=>
	{  
		var nowCall = Math.ceil(needCall);//传入的参数很可能是图便利而传入的浮点
		var nowLoop = 1;
		var result = [];
		for(var i =0; i<10; ++i)
		{
			var ram = singleCost * nowCall;
			if(ram>selfAvaliableRam)
			{
				nowCall = Math.ceil(nowCall/2);
				nowLoop *= 2;
			}
			else
			{
				break;
			}
		} 
		result.push(nowCall);
		result.push(nowLoop);
		return result;
	};

	//outputArray 要保证数据为：1.线程 2.循环数 3.第一次调用时间 4.总时间
	var _print = (reason,outputArray)=>{ 
		ns.tprintf(
			reason + " 解析:目标[%s] , 骇客等级%s , 核心 %s , 当前金钱 %s/%s ,安全等级 %s/%s,"+
			"线程 %s , 循环数%s ,第一次调用时间 %s , 总时间 %s",
			target,_nowHackLevel(), core, _availableMoney(),_maxMoney(),_nowSecurityLevel(),_minSecurityLevel(),
			outputArray[0],outputArray[1],outputArray[2],outputArray[3],
		);
	}

	var _isBestState = ()=>{
		var nowMoney = _availableMoney();
		var maxMoney =_maxMoney();
		var minSecurity = _minSecurityLevel();
		var nowSecurity = _nowSecurityLevel();
		return nowMoney==maxMoney && minSecurity == nowSecurity;
	};

	//make money 2 full by grow
	//declare namespace
	var _grow2max = async (limitLoop)=>
	{
		var nowMoney = _availableMoney();
		var maxMoney =_maxMoney();
		var now2maxMoney = maxMoney - nowMoney;

		var nowGrowCall = 0;//arg0 = 单次call
		var nowGrowLoop = 0;//arg1 = 总批次
		var firstCallTime = _growCallTime();//arg2 = 第一次调用时间
		var totalCallTime = 0;//arg3 = 总时间

		if(now2maxMoney > 0)
		{
			var grow2MaxNeedCall = ns.growthAnalyze(target,now2maxMoney,core);

			var temp = _getAvailableCall(grow2MaxNeedCall,growCost);
			nowGrowCall = temp[0]; 
			nowGrowLoop = temp[1];

			if(limitLoop)
			{
				nowGrowLoop = 1;//限制Loop数量
			}
			
			if( nowGrowCall>0 )
			{
				for(var i = 0; i<nowGrowLoop; ++i)
				{ 
					var pid = ns.exec(growScript, self, nowGrowCall, target);
					if(pid==0)
					{
						ns.tprint("grow 运行失败");
						await ns.sleep(500);
					}
					else
					{
						var delay = _growCallTime();
						totalCallTime += delay;
						await ns.sleep(delay);

						await ns.sleep(500);//使后面能读到正确的数据，并且这里延时也不会过于影响统计
						ns.tprintf("grow 后, 当前金钱 [%s]/[%s]",_availableMoney(),_maxMoney());
					}
				} 
			}
		}

		var result = [nowGrowCall,nowGrowLoop,firstCallTime,totalCallTime];
		return result;
	}

	//make security 2 min by weaken
	var _weaken2Min = async (limitLoop)=>
	{ 
		var minSecurity = _minSecurityLevel();
		var nowSecurity = _nowSecurityLevel();
		var now2minSecurity = nowSecurity - minSecurity;
		var oneWeakenEffect = ns.weakenAnalyze(1,core);
		var weaken2minNeedCall = Math.ceil(now2minSecurity/oneWeakenEffect);
		
		var temp = _getAvailableCall(weaken2minNeedCall,weakenCost); 
		var nowWeakenCall = temp[0]; 
		var nowWeakenLoop = temp[1]; 
		var firstCallTime = _weakenCallTime();
		var totalCallTime = 0;
		
		if(limitLoop)
		{
			nowWeakenLoop = 1;//限制Loop数量
		}
			
		if(nowWeakenCall>0)
		{
			for(var i = 0; i<nowWeakenLoop; ++i)
			{ 
				var pid = ns.exec(weakenScript, self, nowWeakenCall, target);
				if(pid==0)
				{
					ns.tprint("weaken 运行失败");
					await ns.sleep(500);
				}
				else
				{
					var delay = _weakenCallTime();
					totalCallTime += delay;
					await ns.sleep(delay);

					await ns.sleep(500);//使后面能读到正确的数据，并且这里延时也不会过于影响统计
					ns.tprintf("weaken 后, 当前安全等级 [%s]/[%s]",_nowSecurityLevel(),_minSecurityLevel());
				} 
			}
		}

		var result = [nowWeakenCall,nowWeakenLoop,firstCallTime,totalCallTime];
		return result;
	}

	//hack 2 percent
	//make sure money is max
	var _hack2percent = async (percent01,limitLoop)=>{
		var maxMoney = _maxMoney();
		var endMoney = maxMoney * percent01;
		var max2end = maxMoney - endMoney;
		var t = ns.hackAnalyzeThreads(target,max2end); 
		
		var temp = _getAvailableCall(t,hackCost);
		var nowHackCall = temp[0];
		var nowHackLoop = temp[1]; 

		if(limitLoop)
		{
			nowHackLoop = 1;//限制Loop数量
		}
			
		var result = [];
		result.push(nowHackCall);//thread = arg0
		result.push(nowHackLoop);//loop batch = arg1

		var hackTimeFirst = _hackCallTime();
		result.push(hackTimeFirst);//hackTimeFirst = arg2 

		var timeTotal = 0;
		if( nowHackCall>0 )
		{
			for(var i = 0; i<nowHackLoop; ++i)
			{ 
				var pid = ns.exec(hackScript, self, nowHackCall, target);
				if(pid==0)
				{
					ns.tprint("hack 运行失败");
					await ns.sleep(500);
				}
				else
				{
					var delay = _hackCallTime();
					timeTotal+=delay;
					await ns.sleep(delay);
				}
			} 
		}

		result.push(timeTotal);//delay = arg3 
		return result;
	}

	//call first
	//TODO 这里要改成死循环，限制 grow 和 weaken 的loop=1，并且交替调用
	//避免安全等级过高 无法grow
	while(true)
	{
		await _grow2max(true);//把钱长满
		await ns.sleep(500);
		await _weaken2Min(true);//把安全等级降到最低
		await ns.sleep(500);
		if(_isBestState())
		{
			break;
		}
	}

	//调用完成瞬间读出来的结果似乎有误差（未及时更新）
	await ns.sleep(500);
	ns.tprintf("准备工作完成，目标[%s] 当前金钱 %s/%s ,安全等级 %s/%s",target,_availableMoney(),_maxMoney(),_nowSecurityLevel(),_minSecurityLevel());

	//解析一个 batch 的参数、收益
	var _analyzeOnce = async (percent)=>
	{ 
		var hackPercent = percent;//1;//骇走目标多少比例的钱，为0~1
		var hackMoney = _maxMoney() * hackPercent;//理论上可以拿到的钱，TODO:可能和实际有出入

		//实际生产环境中，调用时间是一开始就确定的
		var hackTime = _hackCallTime();
		var growTime = _growCallTime();
		var weakenTime = _weakenCallTime();
		//理论上花费的总时间（这里算的是一批的时间，并且没有算入批次的延时误差，因为所有脚本都会包含这个误差，参考价值不大）
		var totalBatchTime = max([hackTime,growTime,weakenTime]);//他们自带的Math.max 有误差，但是这里传参又只能传数组（以前不用的，不知道更新了什么…）
		ns.tprintf("hackTime=%s,growTime=%s,weakenTime=%s,max=%s",hackTime,growTime,weakenTime,totalBatchTime);

		if(ignoreTimeOver > 0 && totalBatchTime > ignoreTimeOver)
		{
			ns.tprintf("目标[%s] 的解析时间 [%s] > [%s] 过长，忽略",target, totalBatchTime , ignoreTimeOver);
			return null;
		}

		/*
		* 下面返回的通用info 格式为：
			0=thread
			1=loop
			2=firstCallTime
			3=totalTime
		*/

		//在实际生产环境中，不可能loop调用多次，因此需要限制loop为1
		var hackInfo = await _hack2percent( 1-hackPercent ,true);  
		await ns.sleep(500); 
		_print("hack",hackInfo); //注：这里的print是已经执行完这个操作了，下面同这里
		
		var weakenInfo = await _weaken2Min(true);//把安全等级降到最低  
		await ns.sleep(500); 
		_print("weaken",weakenInfo);  
		
		var growInfo = await _grow2max(true);//把钱长满 
		await ns.sleep(500); 
		_print("grow",growInfo); 

		var weakenInfo2 = await _weaken2Min(true);//把安全等级降到最低  
		await ns.sleep(500); 
		_print("weaken",weakenInfo2);  

		//计算一批的价值= 获得金钱 / 总耗时 / RAM消耗
		//理论上获得的金钱等于本次骇入的金钱  
		var totalRAM = hackInfo[0] * hackCost + weakenInfo[0] * weakenCost + growInfo[0] * growCost + weakenInfo2[0] * weakenCost;
		var pow = hackMoney / totalBatchTime / totalRAM;
		ns.tprintf("解析价值：当前骇入百分比 [%s]，权重[%s]=骇入金钱[%s]/总耗时[%s]/RAM消耗[%s]",hackPercent,pow,hackMoney,totalBatchTime,totalRAM);

		//依次将四次执行结果压入
		var result = [];
		result.push(hackInfo);
		result.push(weakenInfo);
		result.push(growInfo);
		result.push(weakenInfo2);
		return result;
	} 

	//通过for循环不难判断出这里权重最高的方式就是直接拉满…
	var r = await _analyzeOnce(1);
	if(r == null)
	{
		ns.tprintf("analyze 失败，返回null");
		return false;
	}

	out['hack'] 	= 	r[0][0]; 
	out['weaken1'] 	= 	r[1][0]; 
	out['grow'] 	= 	r[2][0]; 
	out['weaken2'] 	= 	r[3][0];  

	ns.tprintf("analyze 成功，返回true");
	return true;
}

function max(values)
{ 
	var r = 0.0;
	for(var i in values)
	{
		if(r < values[i])
		{
			r = values[i];
		}
	}
	return r;
}