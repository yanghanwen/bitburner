/** @param {NS} ns **/
export async function main(ns) {

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
			//需要去重
			if(!result.includes(temp))
			{
				result.push(temp);
			}
		}
	} 

	return result;
}