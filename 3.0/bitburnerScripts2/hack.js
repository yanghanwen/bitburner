/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args.length==0)
	{
		ns.tprintf("你必须指定目标");
		return;
	}

	var target = ns.args[0];
	var time = 0;
	if(ns.args.length > 1)
	{
		time = ns.args[1]; 
	}

	if(time>0)
	{
		while(true)
		{
			var now = ns.getTimeSinceLastAug();
			if(now>=time)
			{
				await ns.hack(target); 
				break;
			}
			await ns.sleep(10);
		}
	}
	else
	{
		await ns.hack(target);
	} 
}