/** 
 * @param {NS} ns 
 * @param arg0 = target
 * @param arg1 = timeline  
 * **/
export async function main(ns) 
{ 
	if( ns.args.length == 0 )
	{
		ns.tprintf("你必须指定目标");
		return;
	}

	var target = ns.args[0];
	var time = 0;//理论运行时间
	if(ns.args.length > 1)
	{
		time = ns.args[1]; 
	}

	if(time>0)
	{
		while(true)
		{
			var now = ns.getTimeSinceLastAug();
			if(now >= time)
			{
				await ns.weaken(target);//线程由上层指定 不需要填 
				break;
			}
			await ns.sleep(200);
		}
	}
	else
	{
		await ns.weaken(target);//线程由上层指定 不需要填
	} 
}