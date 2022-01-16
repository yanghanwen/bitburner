/** @param {NS} ns **/
export async function main(ns) {

}
 
/** 
 * @param {NS} ns 
 * 获得所有服务器清单
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


/** 
 * @param {NS} ns 
 * 获得通向某个服务器的路径
 * 不保证奇怪的BUG卡死，所以用异步的
 * **/
export async function scanPath(ns,target)
{
	var map = [];
	var _get = (server)=>{
		var exists = map[server];
		if(exists==undefined)
		{
			map[server] = new Node(server);
		}
		return map[server];
	};

	var start = _get(ns.getHostname());
	var end = _get(target);
	
	var open = [];
	open.push(start); 
	
	while(open.length > 0)
	{ 
		//get min cost node
		open = open.sort(x=>x.deep);
		var current = open.pop();

		//get result
		if(current.node == end.node)
		{
			var i = current;
			var result = [];
			while(i != undefined)
			{
				result.push(i.node);
				i = i.prevNode; 
				await ns.sleep(10);
			}  
			return result;
		}

		var neighbors = ns.scan(current.node);
		for(var i in neighbors)
		{
			//构造一个深度+1的节点
			var neighbor = neighbors[i]; 
			if(neighbor == start.node)
			{
				continue;
			}

			var nNode = _get(neighbor);
			//if undefine
			if(nNode.deep==0)
			{
				nNode.deep = current.deep + 1; 
			}
			
			//如果当前节点更优，则让其指向自己
			if(nNode.prevNode==null || current.deep < nNode.prevNode.deep)
			{
				nNode.prevNode = current;
				nNode.deep = current.deep + 1;
				
				open.push(nNode); 
			} 
		}

		ns.print(current.node," ",open.length);
		await ns.sleep(10);
	} 

	ns.print('find path fail');

	return [];
}

class Node
{
	constructor(node)
	{
		this.node = node;
		this.deep = 0;
		this.prevNode = undefined;
	}
}