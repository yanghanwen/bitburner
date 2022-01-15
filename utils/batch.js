//这些变量是“一台电脑公用”
//不要尝试用IO写入他们，会出问题
//很坑爹不能直接传数组…

let scriptName = '/utils/batch.js'; //当前脚本的名字
let hackScript = '/base/hack.js';
let weakenScript = '/base/weaken.js';
let growScript = '/base/grow.js';

let data = [];

/** @param {NS} ns 
 * 	@param  arg0 = targets
 * 	@param  arg1 = hack
 * 	@param  arg2 = weaken1
 * 	@param  arg3 = grow
 * 	@param  arg4 = weaken2
 * 	@param  arg5 = rand
 * **/
export async function main(ns) {
    ns.disableLog("ALL");

    //参数读取
    //--------------------------------------------------------------
    if (ns.args.length < 6) {
        ns.tprintf("参数不完整 arg0=[%s] arg1=[%s] arg2=[%s] arg3=[%s] arg4=[%s] arg5=[%s]",
            ns.args[0], ns.args[1], ns.args[2], ns.args[3], ns.args[4], ns.args[5]);
        return;
    }

    var host = ns.getHostname();
    var target = ns.args[0];
    var hackCall = ns.args[1];
    var weaken1Call = ns.args[2];
    var growCall = ns.args[3];
    var weaken2Call = ns.args[4];
    var randArg = ns.args[5];
    var randExec = randArg.toString();

    //消耗
    //--------------------------------------------------------------
    var selfCost = ns.getScriptRam(scriptName);
    var availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host) - selfCost;

    var hackCost = ns.getScriptRam(hackScript);
    var weakenCost = ns.getScriptRam(weakenCost);
    var growCost = ns.getScriptRam(growScript);

    //线程兼容
    var batchCost = 0;
    var fixCallFlag = false;

    //可能会传入一个较大的数去作为配比
    //TODO:可以反过来用最小的配比去逆推合适的线程比
    for (var i = 0; i < 3; ++i) {
        var a = hackCall * hackCost;
        var b = weaken1Call * weakenCost;
        var c = growCall * growCost;
        var d = weaken2Call * weakenCost;
        batchCost = a + b + c + d;
        if (batchCost <= availableRam) {
            _print(ns, "成功获取可用call", [batchCost, a, b, c, d, availableRam]);
            fixCallFlag = true;
            break;
        } else {
            _print(ns, "call不可用", [batchCost, a, b, c, d, availableRam]);
        }

        hackCall = Math.ceil(hackCall / 2);
        weaken1Call = Math.ceil(weaken1Call / 2);
        growCall = Math.ceil(growCall / 2);
        weaken2Call = Math.ceil(weaken2Call / 2);

        _print(ns, "call衰减", [hackCall, weaken1Call, growCall, weaken2Call]);
    }

    if (fixCallFlag == false) {
        //error
        ns.print("无法获取合理线程");
        return;
    }

    //时间对齐
    var hackTime = ns.getHackTime(host);
    var growTime = ns.getGrowTime(host);
    var weakenTime = ns.getWeakenTime(host);
    var stepDelay = 1000;//单个脚本检测频率是200毫秒，而容错机制也是200，所以给大点避免调试问题
    
    _print(ns,"time",[hackTime,growTime,weakenTime]);

    var now = ns.getTimeSinceLastAug();
    var batchTimelineEnd = _getValue(target,'batchTimelineEnd');
    var timelineAlign = Math.max(now,batchTimelineEnd);
    _print(ns,"对齐时间",[now,batchTimelineEnd,timelineAlign]);

    var hackTimeline    = timelineAlign + weakenTime - hackTime;
    var weaken1Timeline = timelineAlign + stepDelay;
    var growTimeline    = timelineAlign + weakenTime - growTime + stepDelay * 2;
    var weaken2Timeline = timelineAlign + stepDelay * 3;

    //启动
    var pid = 0;
    pid = ns.exec(hackScript,   host, hackCall,     target,     hackTimeline,       randExec);
    pid = ns.exec(weakenScript, host, weaken1Call,  target,     weaken1Timeline,    randExec);
    pid = ns.exec(growScript,   host, growCall,     target,     growTimeline,       randExec);
    pid = ns.exec(weakenScript, host, weaken2Call,  target,     weaken2Timeline,    randExec);

    _print(ns,"调用时间",[hackTimeline,weaken1Timeline,growTimeline,weaken2Timeline]);
    var t1 = hackTimeline + hackTime;
    var t2 = weaken1Timeline + weakenTime ;
    var t3 = growTimeline + growTime;
    var t4 = weaken2Timeline + weakenTime; 
    var tmin = Math.min(t1,t2,t3,t4);
    var tmax = Math.max(t1,t2,t3,t4);
    _print(ns,"理论触发时间(200毫秒误差容许)",[t1, t2, t3, t4]);

    //不允许任何脚本在hack同一主机时干扰timeline最终得到的这个区间
    _setValue(target,'batchTimelineStart',tmin);
    _setValue(target,'batchTimelineEnd',tmax);
    _print(ns,"对齐时间写入",[tmin,tmax]);
}

function _print(ns, reason, values) {
    var s = "\n --- "+reason + ": \n";
    for (var i in values) {
        s += "[arg" + i + " = ";
        s += values[i];
        s += "],\n";
    }
    s+="\n";
    ns.print(s);
}

function _setValue(target,key,value)
{
    if(data[target]==undefined)
    {
        data[target] = [];
    } 
    data[target][key] = value;
}

function _getValue(target,key)
{
    if(data[target]==undefined)
    {
        return 0;
    } 
    return data[target][key];
}