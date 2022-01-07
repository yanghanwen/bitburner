let nextCanExecuteTime;//下一次脚本可以执行的时间\
let scriptName = 'b.js';
let lock;
let valueDic = [];

/** @param {NS} ns **/
export async function main(ns) {  
	var host = ns.getHostname();
	var target = ns.args[0];//骇取目标
	var rand = ns.args[1];  //独立线程
	var key = rand.toString();
	
	var scriptRam = ns.getScriptRam(scriptName,host);
	var ramFixError = 1;//不知道哪儿来的误差

	while(lock)
	{ 
		await ns.sleep(100);
	}

	//这些变量是“一台电脑公用”
	//后面调用写入的时候会一直卡着（高并时）原因不明
	var nowBatchCost = valueDic[host,nowBatchCost];//当前等级运行batch需要的RAM
	var maxRunBatch = valueDic[host,maxRunBatch];//当前最大可执行数量
	var nowActiveBatch = valueDic[host,nowActiveBatch];//当前正在执行的数量   

	//执行锁定
	if(maxRunBatch > 0 && nowActiveBatch >= maxRunBatch)
	{
		ns.print(host,":maxBatch=",maxRunBatch,",nowBatch=",nowActiveBatch,"锁定中");
		return;
	}
	
	var time = ns.getTimeSinceLastAug();
	if(time<nextCanExecuteTime)
	{
		ns.print(host,":time=",time,",nextCanExecuteTime=",nextCanExecuteTime,"执行时间限制");
		return;
	}

	lock = true;

	ns.print(host,"运行参数：target=",target,",rand=",rand);
	 
	//读取执行时间（在执行前读取，这个数据是可靠的）
	var getHackTime = ns.getHackTime(target);
	var getGrowTime = ns.getGrowTime(target);
	var getWeakenTime = ns.getWeakenTime(target);
	var getMaxTime = max([getHackTime,getGrowTime,getWeakenTime]);

	//获得校准误差后的时间
	var hackTime = fix(getHackTime);
	var growTime = fix(getGrowTime);
	var weakenTime = fix(getWeakenTime);
	var maxTime = max([hackTime,growTime,weakenTime]);

	//对其时间线,计算开始执行的时间
	var errorTime = 500;//坑爹的误差时间
	var d_hackTime = Math.max( maxTime - hackTime,0);
	var d_weakenTime = Math.max( maxTime - weakenTime,0) + errorTime * 1; 
	var d_growTime = Math.max( maxTime - growTime,0) + errorTime * 2;
	var d_weakenTime2 = Math.max( maxTime - weakenTime,0) + errorTime * 3; 
	var realDelayTime = max([d_hackTime,d_weakenTime,d_growTime,d_weakenTime2]);
	 
	//thread TODO
	var hack_t = 206;
	var weaken_t_1 = 9;
	var grow_t = 117;
	var weaken_t_2 = 4;

	var ram1 = 0;
	var ram2 = 0;
	var ram3 = 0;
	var ram4 = 0;

	var ramEnable = false;
	//不知道为什么算出来老是有误差，怀疑是没算这个脚本的COST
	var serverAvalidRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
	for(var i = 0; i < 5; ++i)
	{
		ram1 = ns.getScriptRam('hack.js',host) * hack_t;
		ram2 = ns.getScriptRam('grow.js',host) * grow_t;
		ram3 = ns.getScriptRam('weaken.js',host) * weaken_t_1;
		ram4 = ns.getScriptRam('weaken.js',host) * weaken_t_2;
		var myCost = ram1 + ram2 + ram3 + ram4 + scriptRam + ramFixError; 
		if(serverAvalidRam > myCost)
		{
			ramEnable = true;
			
			/*
			ns.tprintf("当前可用RAM %s 大于 %s(=%s+%s+%s+%s+%s+%s) ，扣除后理论剩余:%s",
			serverAvalidRam,
			myCost,
			ram1,ram2,ram3,ram4,scriptRam,ramFixError,
			serverAvalidRam-myCost); 
			*/

			nowBatchCost = myCost;
			break;
		}
		hack_t = Math.ceil(hack_t/2);
		weaken_t_1 = Math.ceil(weaken_t_1/2);
		grow_t = Math.ceil(grow_t/2);
		weaken_t_2 = Math.ceil(weaken_t_2/2);
	}

	maxRunBatch = Math.floor(serverAvalidRam / nowBatchCost);
	if(!ramEnable)
	{
		ns.print(host,":可用RAM不足");
		lock = false;
		return;
	}
	//ns.tprintf("以线程 %s %s %s %s 启动脚本",hack_t,weaken_t_1,grow_t,weaken_t_2);  
 
	/*
	ns.tprintf("计算出的基本数值：hackTime=%s , grow = %s , weaken = %s , max = %s",getHackTime,getGrowTime,getWeakenTime,getMaxTime);
	ns.tprintf("修正后的基本数值：hackTime=%s , grow = %s , weaken = %s , max = %s",hackTime,growTime,weakenTime,maxTime);
	ns.tprintf("延时：hackTime=%s ,weaken = %s , grow = %s , weaken = %s , realDelayTime = %s",d_hackTime,d_weakenTime,d_growTime,d_weakenTime2,realDelayTime);
	ns.tprintf("理论对齐时间：hackTime=%s ,weaken = %s , grow = %s , weaken = %s ",
	d_hackTime + getHackTime,
	d_weakenTime +getWeakenTime,
	d_growTime + getGrowTime,
	d_weakenTime2 + getWeakenTime);
	*/
	
	//TODO 线程
	//H:W:G:W = 206:9:117:4
	nowActiveBatch+=1;
	var pid = 0;
	
	pid = ns.exec('hack.js',	host,		hack_t,			target,time + d_hackTime,		key);
	ns.tprintf("hack 在 %s 启动,pid=%s ,RAM = %s/%s, 需要 = %s",host,pid,ns.getServerUsedRam(host),ns.getServerMaxRam(host), ram1);

	pid = ns.exec('weaken.js',	host,		weaken_t_1,		target,time + d_weakenTime,		key);
	ns.tprintf("hack 在 %s 启动,pid=%s ,RAM = %s/%s, 需要 = %s",host,pid,ns.getServerUsedRam(host),ns.getServerMaxRam(host), ram2);

	pid = ns.exec('grow.js',	host,		grow_t,			target,time + d_growTime,		key);
	ns.tprintf("hack 在 %s 启动,pid=%s ,RAM = %s/%s, 需要 = %s",host,pid,ns.getServerUsedRam(host),ns.getServerMaxRam(host), ram3);

	pid = ns.exec('weaken.js',	host,		weaken_t_2,		target,time + d_weakenTime2,	key); 
	ns.tprintf("hack 在 %s 启动,pid=%s ,RAM = %s/%s, 需要 = %s",host,pid,ns.getServerUsedRam(host),ns.getServerMaxRam(host), ram4);
	
	//after exec

	valueDic[host,nowBatchCost] = nowBatchCost;//当前等级运行batch需要的RAM
	valueDic[host,maxRunBatch] = maxRunBatch;//当前最大可执行数量
	valueDic[host,nowActiveBatch] = nowActiveBatch;//当前正在执行的数量 
	nextCanExecuteTime = time + errorTime * 4; //执行时间限制

	lock = false;
	await ns.asleep(realDelayTime);
	nowActiveBatch-=1; 
}

function fix(number)
{
	return Math.ceil(number/200) * 200 ;
}

function max(values)
{
	var r = 0.0;
	for(var i in values)
	{
		if(r<values[i])
		{
			r = values[i];
		}
	}
	return r;
}

function min(values)
{
	var r = 2147483647;
	for(var i in values)
	{
		if(r==2147483647 || r > values[i])
		{
			r = values[i];
		}
	}
	return r;
}