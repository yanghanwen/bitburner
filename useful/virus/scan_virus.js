/** @param {NS} ns **/
export async function main(ns) {
    var runCode = ns.args[0]; //必须指定一个特征码,否则会无限循环

    if (ns.args.length == 0) {
        ns.tprintf("params error");
        return;
    }

    var host = ns.getHostname();

    if (ns.fileExists("_lock.txt")) {
        var code = ns.read("_lock.txt");
        if (code == runCode) {
            ns.tprintf("锁定中 %s ", host);
            return;
        } else {
            ns.tprintf("===============>>>> %s 未锁定 , code=%s , runCode=%s ", host, code, runCode);
        }
    }

    await ns.write("_lock.txt", runCode, "w");

    ns.tprintf("============================ ROOT %s  ============================ ", host, runCode);
    ns.run("scan_root.js");
    await ns.sleep(1000);

    ns.tprintf("============================ COPY %s  ============================ ", host, runCode);
    ns.run('scan_copy.js');
    await ns.sleep(1000);

    ns.tprintf("============================ DIFFUSE %s  ============================ ", host, runCode);
    var root = ns.scan(host);
    var purchasedServer = ns.getPurchasedServers();
    for (var i in root) {
        var serverName = root[i];

        if (ns.isRunning('scan_virus.js', serverName)) {
            ns.tprintf("忽略已执行 scan_virus.js 的目标 %s ====> %s", host, serverName);
            continue;
        }

        if (purchasedServer.includes(serverName)) {
            ns.tprintf("忽略自身服务器 %s ====> %s", host, serverName);
            continue;
        }

        ns.tprintf("处理目标机 %s ====> %s", host, serverName);

        if (serverName == 'home') {
            ns.tprintf("忽略 %s ====> home", host);
            continue;
        }

        if (ns.hasRootAccess(serverName)) {
            //kill
            ns.killall(serverName);

            var pid = ns.exec('scan_virus.js', serverName, 1, runCode);
            if (pid != 0) {
                ns.tprintf("在目标机链式执行 成功 %s ====> %s", host, serverName);
            } else {
                ns.tprintf("在目标机链式执行 失败，可能因为RAM不足 %s ====> %s", host, serverName);
            }
        } else {
            ns.tprintf("在目标机链式执行失败，无ROOT权限 %s ====> %s", host, serverName);
        }
    }


    if (host != 'home') {
        ns.tprintf("============================ HACK %s  ============================ ", host);
        ns.run('hack1.js', 1, host);
        await ns.sleep(1000);
    }
}