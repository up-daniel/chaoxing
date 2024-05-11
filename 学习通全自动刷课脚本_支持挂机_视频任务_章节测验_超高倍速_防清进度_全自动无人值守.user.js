// ==UserScript==
// @name         学习通全自动刷课脚本|支持挂机|视频任务|章节测验|超高倍速|防清进度|全自动无人值守
// @namespace    https://scriptcat.org/zh-CN/script-show-page/1701
// @version      2.0.7
// @description  学习通全自动刷课脚本【🥇操作简单】👍帮助大学生从网课中释放出来💡支持学习通视频任务、测试题💥无人值守🔜🎉官网http://danielblog.rf.gd/category/script/。
// @author       DANIEL
// @run-at       document-end
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @match        *://*.nbdlib.cn/*
// @match        *://*.hnsyu.net/*
// @match        *://*.ac.cn/*
// @match        *://*.scriptcat.org/*
// @icon         http://pan-yz.chaoxing.com/favicon.ico
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_info
// @grant        GM_download
// @connect      mooc1-1.chaoxing.com
// @connect      mooc1.chaoxing.com
// @connect      mooc1-2.chaoxing.com
// @connect      passport2-api.chaoxing.com
// @connect      14.29.190.187
// @connect      cx.icodef.com
// @license      GPL-3.0-or-later
//如果脚本提示添加安全网址，请将脚本提示内容填写到下方区域，一行一个，如果不会，请加群询问



//安全网址请填写在上方空白区域
// ==/UserScript==
(() => {
    var token = '', //关注微信公众号：一之哥哥，发送 “token” 领取你的token，填写在两个单引号中间并保存，可以提高答题并发数量。
        jumpType = 0, // 0:智能模式，1:遍历模式，2:不跳转，如果智能模式出现无限跳转/不跳转情况，请切换为遍历模式
        disableMonitor = 0, // 0:无操作，1:解除多端学习监控，开启此功能后可以多端学习，不会被强制下线。
        accuracy = 100, //章节测试正确率百分比，在答题正确率在规定之上并且允许自动提交时才会提交答案
        randomDo = 1, //将0改为1，找不到答案的单选、多选、判断就会自动选【B、ABCD、错】，只在规定正确率不为100%时才生效
        backGround = 0, //是否对接超星挂机小助手，需要先安装对应脚本
        //-----------------------------------------------------------------------------------------------------
        autoLogin = 0, //掉线是否自动登录，1为自动登录，需要配置登录信息（仅支持手机号+密码登陆）
        phoneNumber = '', //自动登录的手机号，填写在单引号之间。
        password = ''; //自动登录的密码，填写在单引号之间。
    //-----------------------------------------------------------------------------------------------------
    var host = 'https://scriptcat.org/zh-CN/script-show-page/1701&',
        rate = GM_getValue('unrivalrate', '1'),
        ctUrl = 'https://cx.icodef.com/wyn-nb?v=4',
        getQueryVariable = (variable) => {
            let q = _l.search.substring(1),
                v = q.split("&"),
                r = false;
            for (let i = 0, l = v.length; i < l; i++) {
                let p = v[i].split("=");
                p[0] == variable && (r = p[1]);
            }
            return r;
        },
        getCookie = name => `; ${document.cookie}`.split(`; ${name}=`).pop().split(';').shift(),
        isCat = GM_info.scriptHandler == 'ScriptCat',
        _w = unsafeWindow,
        _d = _w.document,
        _l = _w.location,
        _p = _l.protocol,
        _h = _l.host,
        //isEdge = _w.navigator.userAgent.includes("Edg/"),
        isFf = _w.navigator.userAgent.includes("Firefox"),
        isMobile = _w.navigator.userAgent.includes("Android"),
        stop = false,
        handleImgs = (s) => {
            imgEs = s.match(/(<img([^>]*)>)/);
            if (imgEs) {
                for (let j = 0, k = imgEs.length; j < k; j++) {
                    let urls = imgEs[j].match(
                        /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/),
                        url;
                    if (urls) {
                        url = urls[0].replace(/http[s]?:\/\//, '');
                        s = s.replaceAll(imgEs[j], url);
                    }
                }
            }
            return s;
        },
        trim = (s) => {
            return handleImgs(s).replaceAll('javascript:void(0);', '').replaceAll("&nbsp;", '').replaceAll("，", ',').replaceAll(
                "。", '.').replaceAll("：", ':').replaceAll("；",
                    ';').replaceAll("？", '?').replaceAll("（", '(').replaceAll("）", ')').replaceAll("“", '"')
                .replaceAll("”", '"').replaceAll("！", '!').replaceAll("-", ' ').replace(/(<([^>]+)>)/ig, '')
                .replace(/^\s+/ig, '').replace(/\s+$/ig, '');
        },
        cVersion = 999,
        classId = getQueryVariable('clazzid') || getQueryVariable('clazzId') || getQueryVariable('classid') ||
            getQueryVariable('classId'),
        courseId = getQueryVariable('courseid') || getQueryVariable('courseId'),
        UID = getCookie('_uid') || getCookie('UID'),
        FID = getCookie('fid'),
        jq = _w.top.$ || _w.top.jQuery;
    _w.confirm = (msg) => {
        return true;
    }
    setInterval(function () {
        _w.confirm = (msg) => {
            return true;
        }
    }, 2000);
    if (parseFloat(rate) == parseInt(rate)) {
        rate = parseInt(rate);
    } else {
        rate = parseFloat(rate);
    }
    try {
        _w.top.unrivalReviewMode = GM_getValue('unrivalreview', '0') || '0';
        _w.top.unrivalDoWork = GM_getValue('unrivaldowork', '1') || '1';
        _w.top.unrivalAutoSubmit = GM_getValue('unrivalautosubmit', '1') || '1';
        _w.top.unrivalAutoSave = GM_getValue('unrivalautosave', '0') || '0';
    } catch (e) { }
    if (_l.href.indexOf("knowledge/cards") > 0) {
        let allowBackground = false,
            spans = _d.getElementsByTagName('span');
        for (let i = 0, l = spans.length; i < l; i++) {
            if (spans[i].innerHTML.indexOf('章节未开放') != -1) {
                if (_l.href.indexOf("ut=s") != -1) {
                    _l.href = _l.href.replace("ut=s", "ut=t").replace(/&cpi=[0-9]{1,10}/, '');
                } else if (_l.href.indexOf("ut=t") != -1) {
                    spans[i].innerHTML = '此课程为闯关模式，请回到上一章节完成学习任务！'
                    return;
                }
                break;
            }
        }
        _w.top.unrivalPageRd = String(Math.random());
        if (!isFf) {
            try {
                cVersion = parseInt(navigator.userAgent.match(/Chrome\/[0-9]{2,3}./)[0].replace('Chrome/', '')
                    .replace('.', ''));
            } catch (e) { }
        }
        var busyThread = 0,
            getStr = (str, start, end) => {
                let res = str.substring(str.indexOf(start), str.indexOf(end)).replace(start, '');
                return res;
            },
            scripts = _d.getElementsByTagName('script'),
            param = null;
        for (let i = 0, l = scripts.length; i < l; i++) {
            if (scripts[i].innerHTML.indexOf('mArg = "";') != -1 && scripts[i].innerHTML.indexOf(
                '==UserScript==') == -1) {
                param = getStr(scripts[i].innerHTML, 'try{\n    mArg = ', ';\n}catch(e){');
            }
        }
        if (param == null) {
            return;
        }
        try {
            vrefer = _d.getElementsByClassName('ans-attach-online ans-insertvideo-online')[0].src;
        } catch (e) {
            vrefer = _p + '//' + _h + '/ananas/modules/video/index.html?v=2022-1118-1729';
        }
        GM_setValue('vrefer', vrefer);
        GM_setValue('host', _h);
        _d.getElementsByTagName("html")[0].innerHTML = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>学习通刷课脚本</title>
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
    <link href="https://z.chaoxing.com/yanshi/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="row" style="margin: 10px;">
            <div class="col-md-6 col-md-offset-3">
                <div class="header clearfix">
                    <h3 class="text-muted" style="margin-top: 40px;margin-bottom: 0;float: left;"><a href=https://scriptcat.org/zh-CN/script-show-page/1701>学习通刷课脚本&ensp;</a></h3><div id="onlineNum"></div>
                </div>
                <hr style="margin-top: 10px;margin-bottom: 20px;">
                <div class="panel panel-info" id="normalQuery">
                    <div class="panel-heading">功能配置</div>
                    <div class="panel-body">
                        <div>
                            <div style="padding: 0;font-size: 20px;float: left;">视频倍速：</div>
                            <div>
                                <input type="number" id="unrivalRate" style="width: 80px;">
                                &ensp;
                                <a id='updateRateButton' class="btn btn-default">保存</a>
                                &nbsp;|&nbsp;
                                <a id='reviewModeButton' class="btn btn-default">复习模式</a>
                                &nbsp;|&nbsp;
                                <a id='fuckMeModeButton' class="btn btn-default" href="http://pan-yz.chaoxing.com/favicon.ico" target="view_window">后台挂机</a>
                                &nbsp;
                                <a id='backGround' class="btn btn-default" target="view_window">激活挂机</a>
                            </div><br>
                            <div style="padding: 0;font-size: 20px;float: left;">章节测试：</div>
                            <a id='autoDoWorkButton' class="btn btn-default">自动答题</a>&nbsp;|&nbsp;
                            <a id='autoSubmitButton' class="btn btn-default">自动提交</a>&nbsp;|&nbsp;
                            <a id='autoSaveButton' class="btn btn-default">自动保存</a>
                        </div>
                    </div>
                </div>
                <div class="panel panel-info" id='videoTime' style="display: none;height: 300px;">
                    <div class="panel-heading">学习进度</div>
                    <div class="panel-body" style="height: 100%;">
                        <iframe id="videoTimeContent" src="" frameborder="0" scrolling="auto"
                            style="width: 100%;height: 85%;"></iframe>
                    </div>
                </div>
                <div class="panel panel-info">
                    <div class="panel-heading">任务列表</div>
                    <div class="panel-body" id='joblist'>
                    </div>
                </div>
                <div class="panel panel-info">
                    <div class="panel-heading">运行日志</div>
                    <div class="panel-body">
                        <div id="result" style="overflow:auto;line-height: 30px;">
                            <div id="log">
                                <span style="color: red">[00:00:00]如果此提示不消失，说明页面出现了错误，请联系DANIEL</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel panel-info" id='workPanel' style="display: none;height: 1000px;">
                    <div class="panel-heading">章节测试</div>
                    <div class="panel-body" id='workWindow' style="height: 100%;">
                        <iframe id="frame_content" name="frame_content" src="" frameborder="0" scrolling="auto"
                            style="width: 100%;height: 95%;"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
`;
        var logs = {
            "logArry": [],
            "addLog": function (str, color = "black") {
                if (this.logArry.length >= 50) {
                    this.logArry.splice(0, 1);
                }
                var nowTime = new Date();
                var nowHour = (Array(2).join(0) + nowTime.getHours()).slice(-2);
                var nowMin = (Array(2).join(0) + nowTime.getMinutes()).slice(-2);
                var nowSec = (Array(2).join(0) + nowTime.getSeconds()).slice(-2);
                this.logArry.push("<span style='color: " + color + "'>[" + nowHour + ":" + nowMin + ":" +
                    nowSec + "] " + str + "</span>");
                let logStr = "";
                for (let logI = 0, logLen = this.logArry.length; logI < logLen; logI++) {
                    logStr += this.logArry[logI] + "<br>";
                }
                _d.getElementById('log').innerHTML = logStr;
                var logElement = _d.getElementById('log');
                logElement.scrollTop = logElement.scrollHeight;
            }
        },
            htmlHook = setInterval(function () {
                if (_d.getElementById('unrivalRate') && _d.getElementById('updateRateButton') && _d
                    .getElementById('reviewModeButton') && _d.getElementById('autoDoWorkButton') && _d
                        .getElementById('autoSubmitButton') && _d.getElementById('autoSaveButton')) {
                    if (!backGround) {
                        _d.getElementById('fuckMeModeButton').style.display = "none";
                    }
                    allowBackground = Math.round(new Date() / 1000) - parseInt(GM_getValue(
                        'unrivalBackgroundVideoEnable',
                        '6')) < 15;
                    if (allowBackground) {
                        _d.getElementById('fuckMeModeButton').setAttribute('href', 'unrivalxxtbackground/');
                    }
                    clearInterval(htmlHook);
                    if (cVersion < 86) {
                        logs.addLog(
                            '\u60a8\u7684\u6d4f\u89c8\u5668\u5185\u6838\u8fc7\u8001\uff0c\u8bf7\u66f4\u65b0\u7248\u672c\u6216\u4f7f\u7528\u4e3b\u6d41\u6d4f\u89c8\u5668\uff0c\u63a8\u8350\u003c\u0061\u0020\u0068\u0072\u0065\u0066\u003d\u0022\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006d\u0069\u0063\u0072\u006f\u0073\u006f\u0066\u0074\u002e\u0063\u006f\u006d\u002f\u007a\u0068\u002d\u0063\u006e\u002f\u0065\u0064\u0067\u0065\u0022\u0020\u0074\u0061\u0072\u0067\u0065\u0074\u003d\u0022\u0076\u0069\u0065\u0077\u005f\u0077\u0069\u006e\u0064\u006f\u0077\u0022\u003e\u0065\u0064\u0067\u0065\u6d4f\u89c8\u5668\u003c\u002f\u0061\u003e',
                            'red');
                        stop = true;
                        return;
                    }
                    if (isMobile) {
                        logs.addLog('手机浏览器不保证能正常运行此脚本', 'orange');
                    }
                    _d.addEventListener('visibilitychange', function () {
                        let isH = _d.hidden;
                        if (!isH) {
                            logs.addLog('DANIEL提醒你：你可扫描图片中二维码给DANIEL一点小小的赞助，你的支持能给我们动力', '#66CCFF');
                        }
                    });
                    _d.getElementById('unrivalRate').value = rate;
                    _d.getElementById('updateRateButton').onclick = function () {
                        let urate = _d.getElementById('unrivalRate').value;
                        if (parseFloat(urate) == parseInt(urate)) {
                            urate = parseInt(urate);
                        } else {
                            urate = parseFloat(urate);
                        }
                        GM_setValue('unrivalrate', urate);
                        rate = urate;
                        if (urate > 0) {
                            logs.addLog('视频倍速已更新为' + urate + '倍，将在3秒内生效', 'green');
                        } else {
                            logs.addLog('奇怪的倍速，将会自动跳过视频任务', 'orange');
                        }
                    }
                    _d.getElementById('backGround').onclick = function () {
                        logs.addLog('挂机激活成功，您现在可以最小化页面了', 'green');
                        _w.top.backNow = 1;
                    }
                    _d.getElementById('reviewModeButton').onclick = function () {
                        let reviewButton = _d.getElementById('reviewModeButton');
                        if (reviewButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('reviewModeButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('复习模式已开启，遇到已完成的视频任务不会跳过', 'green');
                            GM_setValue('unrivalreview', '1');
                            _w.top.unrivalReviewMode = '1';
                        } else {
                            _d.getElementById('reviewModeButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('复习模式已关闭，遇到已完成的视频任务会自动跳过', 'green');
                            GM_setValue('unrivalreview', '0');
                            _w.top.unrivalReviewMode = '0';
                        }
                    }
                    _d.getElementById('autoDoWorkButton').onclick = function () {
                        let autoDoWorkButton = _d.getElementById('autoDoWorkButton');
                        if (autoDoWorkButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('autoDoWorkButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('自动做章节测试已开启，将会自动做章节测试', 'green');
                            GM_setValue('unrivaldowork', '1');
                            _w.top.unrivalDoWork = '1';
                        } else {
                            _d.getElementById('autoDoWorkButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('自动做章节测试已关闭，将不会自动做章节测试', 'green');
                            GM_setValue('unrivaldowork', '0');
                            _w.top.unrivalDoWork = '0';
                        }
                    }
                    _d.getElementById('autoSubmitButton').onclick = function () {
                        let autoSubmitButton = _d.getElementById('autoSubmitButton');
                        if (autoSubmitButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('autoSubmitButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('符合提交标准的章节测试将会自动提交', 'green');
                            GM_setValue('unrivalautosubmit', '1');
                            _w.top.unrivalAutoSubmit = '1';
                        } else {
                            _d.getElementById('autoSubmitButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('章节测试将不会自动提交', 'green');
                            GM_setValue('unrivalautosubmit', '0');
                            _w.top.unrivalAutoSubmit = '0';
                        }
                    }
                    _d.getElementById('autoSaveButton').onclick = function () {
                        let autoSaveButton = _d.getElementById('autoSaveButton');
                        if (autoSaveButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('autoSaveButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('不符合提交标准的章节测试将会自动保存', 'green');
                            GM_setValue('unrivalautosave', '1');
                            _w.top.unrivalAutoSave = '1';
                        } else {
                            _d.getElementById('autoSaveButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('不符合提交标准的章节测试将不会自动保存，等待用户自己操作', 'green');
                            GM_setValue('unrivalautosave', '0');
                            _w.top.unrivalAutoSave = '0';
                        }
                    }
                    _d.getElementById('videoTimeButton').onclick = function () {
                        _d.getElementById('videoTime').style.display = 'block';
                        _d.getElementById('videoTimeContent').src = _p +
                            '//stat2-ans.chaoxing.com/task/s/index?courseid=' + courseId + '&clazzid=' +
                            classId;
                    }
                }
            }, 100),
            loopjob = () => {
                if (_w.top.unrivalScriptList.length > 1) {
                    logs.addLog('您同时开启了多个刷课脚本要当心', 'red');
                }
                if (cVersion < 8.6 * 10) {
                    logs.addLog(
                        '\u60a8\u7684\u6d4f\u89c8\u5668\u5185\u6838\u8fc7\u8001\uff0c\u8bf7\u66f4\u65b0\u7248\u672c\u6216\u4f7f\u7528\u4e3b\u6d41\u6d4f\u89c8\u5668\uff0c\u63a8\u8350\u003c\u0061\u0020\u0068\u0072\u0065\u0066\u003d\u0022\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006d\u0069\u0063\u0072\u006f\u0073\u006f\u0066\u0074\u002e\u0063\u006f\u006d\u002f\u007a\u0068\u002d\u0063\u006e\u002f\u0065\u0064\u0067\u0065\u0022\u0020\u0074\u0061\u0072\u0067\u0065\u0074\u003d\u0022\u0076\u0069\u0065\u0077\u005f\u0077\u0069\u006e\u0064\u006f\u0077\u0022\u003e\u0065\u0064\u0067\u0065\u6d4f\u89c8\u5668\u003c\u002f\u0061\u003e',
                        'red');
                    stop = true;
                    return;
                }
                if (stop) {
                    return;
                }
                let missionli = missionList;
                if (missionli == []) {
                    setTimeout(loopjob, 500);
                    return;
                }
                for (let itemName in missionli) {
                    if (missionli[itemName]['running']) {
                        setTimeout(loopjob, 500);
                        return;
                    }
                }
                for (let itemName in missionli) {
                    if (!missionli[itemName]['done']) {
                        switch (missionli[itemName]['type']) {
                            case 'video':
                                doVideo(missionli[itemName]);
                                break;
                            case 'document':
                                doDocument(missionli[itemName]);
                                break;
                            case 'work':
                                doWork(missionli[itemName]);
                                break;
                        }
                        setTimeout(loopjob, 500);
                        return;
                    }
                }
                if (busyThread <= 0) {
                    if (jumpType != 2) {
                        _w.top.jump = true;
                        logs.addLog('所有任务处理完毕，5秒后自动下一章', 'green');
                    } else {
                        logs.addLog('所有任务处理完毕，用户设置为不跳转，脚本已结束运行，如需自动跳转，请编辑脚本代码参数', 'green');
                    }
                    clearInterval(loopjob);
                } else {
                    setTimeout(loopjob, 500);
                }
            },
            readyCheck = () => {
                setTimeout(function () {
                    try {
                        if (!isCat) {
                            logs.addLog('若整个课程刷完后，还存在未刷任务点，可能是因为准确率未达到100%，另一款答题考试脚本（使用时请关闭刷课脚本且最后需要手动提交答案）可以解决此问题<a href="https://scriptcat.org/zh-CN/script-show-page/1711" target="_blank">点击这里</a>', 'purple');
                            logs.addLog(
                                'DANIEL提醒你：本脚本仅限用于刷水课，不得用于刷重要课程，否则后果自付',
                                'green');
                                logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="http://danielblog.rf.gd/archives/2/" target="_blank">点击这里</a> 查看更换token方法', 'red');
                        }
                        if (_w.top.unrivalReviewMode == '1') {
                            logs.addLog('若整个课程刷完后，还存在未刷任务点，可能是因为准确率未达到100%，另一款答题考试脚本（使用时请关闭刷课脚本且最后需要手动提交答案）可以解决此问题<a href="https://scriptcat.org/zh-CN/script-show-page/1711" target="_blank">点击这里</a>', 'purple');
                            logs.addLog('DANIEL提醒你：复习模式已开启，遇到已完成的视频任务不会跳过', 'green');
                            logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="https://scriptcat.org/zh-CN/script-show-page/1701" target="_blank">点击这里</a> 查看更换token方法', 'red');
                            _d.getElementById('reviewModeButton').setAttribute('class', ['btn btn-default',
                                'btn btn-success'
                            ][_w.top.unrivalReviewMode]);
                        }
                        if (_w.top.unrivalDoWork == '1') {
                            logs.addLog('若整个课程刷完后，还存在未刷任务点，可能是因为准确率未达到100%，另一款答题考试脚本（使用时请关闭刷课脚本且最后需要手动提交答案）可以解决此问题<a href="https://scriptcat.org/zh-CN/script-show-page/1711" target="_blank">点击这里</a>', 'purple');
                            logs.addLog('DANIEL提醒你：自动做章节测试已开启，将会自动做章节测试', 'green');
                            logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="http://danielblog.rf.gd/archives/2/" target="_blank">点击这里</a> 查看更换token方法', 'red');
                            _d.getElementById('autoDoWorkButton').setAttribute('class', ['btn btn-default',
                                'btn btn-success'
                            ][_w.top.unrivalDoWork]);
                        }
                        _d.getElementById('autoSubmitButton').setAttribute('class', ['btn btn-default',
                            'btn btn-success'
                        ][_w.top.unrivalAutoSubmit]);
                        _d.getElementById('autoSaveButton').setAttribute('class', ['btn btn-default',
                            'btn btn-success'
                        ][_w.top.unrivalAutoSave]);
                    } catch (e) {
                        console.log(e);
                        readyCheck();
                        return;
                    }
                }, 500);
            }
        readyCheck();
        try {
            var pageData = JSON.parse(param);
        } catch (e) {
            if (jumpType != 2) {
                _w.top.jump = true;
                logs.addLog('运行日志里最下方每十秒会汇报一次单节课刷课进度，右侧边能够滑动，可以看到整个课程刷课进度，已刷的课会显示绿色对勾<a href="https://scriptcat.org/zh-CN/script-show-page/1701" target="_blank">更多问题点击这里</a>', 'red');
                logs.addLog('若整个课程刷完后，还存在未刷任务点，可能是因为准确率未达到100%，另一款答题考试脚本（使用时请关闭刷课脚本且最后需要手动提交答案）可以解决此问题<a href="https://scriptcat.org/zh-CN/script-show-page/1711" target="_blank">点击这里</a>', 'purple');
                logs.addLog('DANIEL提醒你：此页无任务，5秒后自动下一章', 'green');
                logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="http://danielblog.rf.gd/archives/2/" target="_blank">点击这里</a> 查看更换token方法', 'red');
            } else {
                logs.addLog('DANIEL提醒你：此页无任务，用户设置为不跳转，脚本已结束运行，如需自动跳转，请编辑脚本代码参数', 'green');
                logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="http://danielblog.rf.gd/archives/2/" target="_blank">点击这里</a> 查看更换token方法', 'red');
            }
            return;
        }
        var data = pageData['defaults'],
            jobList = [],
            classId = data['clazzId'],
            chapterId = data['knowledgeid'],
            reportUrl = data['reportUrl'],
            ktoken = data['ktoken'];
        UID = UID || data['userid'];
        FID = FID || data['fid'];
        for (let i = 0, l = pageData['attachments'].length; i < l; i++) {
            let item = pageData['attachments'][i];
            if (item['job'] != true || item['isPassed'] == true) {
                if (_w.top.unrivalReviewMode == '1' && item['type'] == 'video') {
                    jobList.push(item);
                }
                continue;
            } else {
                jobList.push(item);
            }
        }
        var video_getReady = (item) => {
            let statusUrl = _p + '//' + _h + '/ananas/status/' + item['property']['objectid'] + '?k=' +
                FID + '&flag=normal&_dc=' + String(Math.round(new Date())),
                doubleSpeed = item['property']['doublespeed'];
            busyThread += 1;
            GM_xmlhttpRequest({
                method: "get",
                headers: {
                    'Host': _h,
                    'Referer': vrefer,
                    'Sec-Fetch-Site': 'same-origin'
                },
                url: statusUrl,
                onload: function (res) {
                    try {
                        busyThread -= 1;
                        let videoInfo = JSON.parse(res.responseText),
                            duration = videoInfo['duration'],
                            dtoken = videoInfo['dtoken'];
                        if (duration == undefined) {
                            _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[无效视频]' + item['property']['name'] + `
                                </div>
                            </div>`
                            return;
                        }
                        missionList['m' + item['jobid']] = {
                            'module': item['property']['module'],
                            'type': 'video',
                            'dtoken': dtoken,
                            'duration': duration,
                            'objectId': item['property']['objectid'],
                            'rt': item['property']['rt'] || '0.9',
                            'otherInfo': item['otherInfo'],
                            'doublespeed': doubleSpeed,
                            'jobid': item['jobid'],
                            'name': item['property']['name'],
                            'done': false,
                            'running': false
                        };
                        var base222 = `data:image/jpeg;base64,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`
                        _d.getElementById('joblist').innerHTML += `

                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '<img src="' + base222 + '" alt="Smiley face" width="400" height="175">' + `
                                </div>
                                <div class="panel-body">
                                    ` + '[视频]' + item['property']['name'] + `
                                </div>
                            </div>`
                    } catch (e) { }
                },
                onerror: function (err) {
                    console.log(err);
                    if (err.error.indexOf('@connect list') >= 0) {
                        logs.addLog('请添加安全网址，将 【 //@connect      ' + _h +
                            ' 】方括号里的内容(不包括方括号)添加到脚本代码内指定位置，否则脚本无法正常运行，如图所示：', 'red');
                        logs.addLog(
                            '<img src="http://pan-yz.chaoxing.com/favicon.ico">'
                        );
                        stop = true;
                    } else {
                        logs.addLog('获取任务详情失败', 'red');
                        logs.addLog('错误原因：' + err.error, 'red');
                    }
                }
            });
        },
            doVideo = (item) => {
                if (rate <= 0) {
                    missionList['m' + item['jobid']]['running'] = true;
                    logs.addLog('奇怪的倍速，视频已自动跳过', 'orange');
                    setTimeout(function () {
                        missionList['m' + item['jobid']]['running'] = false;
                        missionList['m' + item['jobid']]['done'] = true;
                    }, 5000);
                    return;
                }
                if (allowBackground && backGround) {
                    if (_w.top.document.getElementsByClassName('catalog_points_sa').length > 0 || _w.top.document
                        .getElementsByClassName('lock').length > 0) {
                        logs.addLog('此课程可能为闯关模式，不支持后台挂机，将为您在线完成', 'brown');
                    } else {
                        item['userid'] = UID;
                        item['classId'] = classId;
                        item['review'] = [false, true][_w.top.unrivalReviewMode];
                        item['reportUrl'] = reportUrl;
                        item['rt'] = missionList['m' + item['jobid']]['rt'];
                        GM_setValue('unrivalBackgroundVideo', item);
                        _d.cookie = "videojs_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        logs.addLog(
                            '您已安装超星挂机小助手，已添加至后台任务，<a href="unrivalxxtbackground/" target="view_window">点我查看后台</a>',
                            'green');
                        missionList['m' + item['jobid']]['running'] = true;
                        setTimeout(function () {
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        }, 5000);
                        return;
                    }
                }
                let videojs_id = String(parseInt(Math.random() * 9999999));
                _d.cookie = 'videojs_id=' + videojs_id + ';path=/'
                logs.addLog('DANIEL正在开始帮你刷视频：' + item['name'] + '，倍速：' + String(rate) + '倍');
                logs.addLog('DANIEL提醒你：视频观看信息每10秒上报一次，请耐心等待，如果长时间不更新请刷新一下', 'green');
                logs.addLog('若整个课程刷完后，还存在未刷任务点，可能是因为准确率未达到100%，另一款答题考试脚本（使用时请关闭刷课脚本且最后需要手动提交答案）可以解决此问题<a href="https://scriptcat.org/zh-CN/script-show-page/1711" target="_blank">点击这里</a>', 'purple');
                logs.addLog('DANIEL提醒你：你可扫描图片中二维码给DANIEL一点小小的赞助，你的支持能给我们动力', 'brown');
                if (disableMonitor) {
                    logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="https://scriptcat.org/zh-CN/script-show-page/1701" target="_blank">点击这里</a> 查看更换token的方法', 'red');
                }
                let dtype = 'Video';
                if (item['module'].includes('audio')) {
                    dtype = 'Audio';
                    rt = '';
                }
                let playTime = 0,
                    playsTime = 0,
                    isdrag = '3',
                    times = 0,
                    encUrl = '',
                    first = true,
                    loop = setInterval(function () {
                        if (rate <= 0) {
                            clearInterval(loop);
                            logs.addLog('DANIEL提醒你：奇怪的倍速，视频已自动跳过', 'orange');
                            setTimeout(function () {
                                missionList['m' + item['jobid']]['running'] = false;
                                missionList['m' + item['jobid']]['done'] = true;
                            }, 5000);
                            return;
                        } else if (item['doublespeed'] == 0 && rate > 1 && _w.top.unrivalReviewMode == '0') {
                            rate = 1;
                            logs.addLog('DANIEL提醒你：该视频不允许倍速播放，已恢复至一倍速，高倍速会被清空进度挂科，勿存侥幸', 'red');
                        }
                        rt = missionList['m' + item['jobid']]['rt'];
                        playsTime += rate;
                        playTime = Math.ceil(playsTime);
                        if (times == 0 || times % 10 == 0 || playTime >= item['duration']) {
                            if (first) {
                                playTime = 0;
                            }
                            if (playTime >= item['duration']) {
                                clearInterval(loop);
                                playTime = item['duration'];
                                isdrag = '4';
                            } else if (playTime > 0) {
                                isdrag = '0';
                            }
                            encUrl = host + 'chaoXing/v3/getEnc.php?classid=' + classId +
                                '&playtime=' + playTime + '&duration=' + item['duration'] + '&objectid=' + item[
                                'objectId'] + '&jobid=' + item['jobid'] + '&uid=' + UID;
                            busyThread += 1;
                            var _bold_playTime = playTime;
                            function ecOnload(res) {
                                let enc = '';
                                if (res && res.status == 200) {
                                    enc = res.responseText;
                                    if (enc.includes('--#')) {
                                        let warnInfo = enc.match(new RegExp('--#(.*?)--#', "ig"))[0]
                                            .replace(/--#/ig, '');
                                        logs.addLog(warnInfo, 'red');
                                        enc = enc.replace(/--#(.*?)--#/ig, '');
                                    }
                                    if (enc.indexOf('.stop') >= 0) {
                                        clearInterval(loop);
                                        stop = true;
                                        return;
                                    }
                                } else {
                                    strEc = `[${classId}][${UID}][${item['jobid']}][${item['objectId']}][${playTime * 1000}][d_yHJ!$pdA~5][${item['duration'] * 1000}][0_${item['duration']}]`,
                                        enc = jq.md5(strEc);
                                }
                                if (enc.length != 32) {
                                    clearInterval(loop);
                                    stop = true;
                                    return;
                                }
                                let reportsUrl = reportUrl + '/' + item['dtoken'] +
                                    '?clazzId=' + classId + '&playingTime=' + playTime +
                                    '&duration=' + item['duration'] + '&clipTime=0_' + item[
                                    'duration'] + '&objectId=' + item['objectId'] +
                                    '&otherInfo=' + item['otherInfo'] + '&jobid=' + item[
                                    'jobid'] + '&userid=' + UID + '&isdrag=' + isdrag +
                                    '&view=pc&enc=' + enc + '&rt=' + rt + '&dtype=' + dtype +
                                    '&_t=' + String(Math.round(new Date()));
                                GM_xmlhttpRequest({
                                    method: "get",
                                    headers: {
                                        'Host': _h,
                                        'Referer': vrefer,
                                        'Sec-Fetch-Site': 'same-origin',
                                        'Content-Type': 'application/json'
                                    },
                                    url: reportsUrl,
                                    onload: function (res) {
                                        try {
                                            let today = new Date(),
                                                todayStr = today.getFullYear() +
                                                    'd' + today.getMonth() + 'd' + today
                                                        .getDate(),
                                                timelong = GM_getValue(
                                                    'unrivaltimelong', {});
                                            if (timelong[UID] == undefined ||
                                                timelong[UID]['today'] != todayStr
                                            ) {
                                                timelong[UID] = {
                                                    'time': 0,
                                                    'today': todayStr
                                                };
                                            } else {
                                                timelong[UID]['time']++;
                                            }
                                            GM_setValue('unrivaltimelong',
                                                timelong);
                                            busyThread -= 1;
                                            if (timelong[UID]['time'] / 60 > 22 &&
                                                item['doublespeed'] == 0 && _w.top
                                                    .unrivalReviewMode == '0') {
                                                clearInterval(loop);
                                                logs.addLog(
                                                    'DANIEL提醒你：今日学习时间过长，继续学习会导致清空进度，请明天再来',
                                                    'red');
                                                setTimeout(function () {
                                                    missionList['m' + item[
                                                        'jobid']][
                                                        'running'
                                                    ] = false;
                                                    missionList['m' + item[
                                                        'jobid']][
                                                        'done'
                                                    ] = true;
                                                }, 5000);
                                                return;
                                            }
                                            let ispass = JSON.parse(res
                                                .responseText);
                                            first = false;
                                            if (ispass['isPassed'] && _w.top
                                                .unrivalReviewMode == '0') {
                                                logs.addLog('DANIEL提醒你：视频任务已完成', 'green');
                                                missionList['m' + item['jobid']]['running'] = false;
                                                missionList['m' + item['jobid']]['done'] = true;
                                                clearInterval(loop);
                                                return;
                                            } else if (isdrag == '4') {
                                                if (_w.top.unrivalReviewMode ==
                                                    '1') {
                                                    logs.addLog('DANIEL提醒你：视频已观看完毕', 'green');
                                                } else {
                                                    logs.addLog('DANIEL提醒你：视频已观看完毕，但视频任务未完成，刷视频倍速不要调得太快了',
                                                        'red');
                                                }
                                                missionList['m' + item['jobid']][
                                                    'running'
                                                ] = false;
                                                missionList['m' + item['jobid']][
                                                    'done'
                                                ] = true;
                                                try {
                                                    clearInterval(loop);
                                                } catch (e) {

                                                }
                                            } else {
                                                logs.addLog(item['name'] + '已观看' +
                                                    _bold_playTime + '秒，剩余大约' +
                                                    String(item['duration'] -
                                                        _bold_playTime) + '秒');
                                            }
                                        } catch (e) {
                                            console.log(e);
                                            if (res.responseText.indexOf('验证码') >=
                                                0) {
                                                logs.addLog('DANIEL提醒你：已被超星风控，请<a href="' +
                                                    reportsUrl +
                                                    '" target="_blank">点我处理</a>，60秒后自动刷新页面',
                                                    'red');
                                                missionList['m' + item['jobid']][
                                                    'running'
                                                ] = false;
                                                clearInterval(loop);
                                                stop = true;
                                                setTimeout(function () {
                                                    _l.reload();
                                                }, 60000);
                                                return;
                                            }
                                            logs.addLog('DANIEL提醒你：超星返回错误信息，十秒后重试', 'red');
                                            times = -10;
                                            return;
                                        }
                                    },
                                    onerror: function (err) {
                                        console.log(err);
                                        if (err.error.indexOf('@connect list') >=
                                            0) {
                                            logs.addLog(
                                                '请添加安全网址，将 【 //@connect      ' +
                                                _h +
                                                ' 】方括号里的内容(不包括方括号)添加到脚本代码内指定位置，否则脚本无法正常运行，如图所示：',
                                                'red');
                                            logs.addLog(
                                                '<img src="https://pan-yz.chaoxing.com/thumbnail/0,0,0/609a8b79cbd6a91d10c207cf2b5f368d">'
                                            );
                                            stop = true;
                                        } else {
                                            logs.addLog('观看视频失败', 'red');
                                            logs.addLog('错误原因：' + err.error, 'red');
                                        }
                                        missionList['m' + item['jobid']][
                                            'running'
                                        ] = false;
                                        clearInterval(loop);
                                    }
                                });
                            };
                            GM_xmlhttpRequest({
                                method: "get",
                                url: encUrl,
                                timeout: 2000,
                                onload: ecOnload,
                                onerror: function (err) {
                                    console.log(err);
                                    ecOnload(false);
                                },
                                ontimeout: function (err) {
                                    console.log(err);
                                    ecOnload(false);
                                }
                            });
                        }
                        times += 1;
                    }, 1000);
                missionList['m' + item['jobid']]['running'] = true;
            },
            doDocument = (item) => {
                missionList['m' + item['jobid']]['running'] = true;
                logs.addLog('开始刷文档：' + item['name']);
                setTimeout(function () {
                    busyThread += 1;
                    GM_xmlhttpRequest({
                        method: "get",
                        url: _p + '//' + _h + '/ananas/job/document?jobid=' + item['jobid'] +
                            '&knowledgeid=' + chapterId + '&courseid=' + courseId + '&clazzid=' +
                            classId + '&jtoken=' + item['jtoken'],
                        onload: function (res) {
                            try {
                                busyThread -= 1;
                                let ispass = JSON.parse(res.responseText);
                                if (ispass['status']) {
                                    logs.addLog('文档任务已完成', 'green');
                                } else {
                                    logs.addLog('文档已阅读完成，但任务点未完成', 'red');
                                }

                            } catch (err) {
                                console.log(err);
                                console.log(res.responseText);
                                logs.addLog('解析文档内容失败', 'red');
                            }
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        },
                        onerror: function (err) {
                            console.log(err);
                            if (err.error.indexOf('@connect list') >= 0) {
                                logs.addLog('请添加安全网址，将 【 //@connect      ' + _h +
                                    ' 】方括号里的内容(不包括方括号)添加到脚本代码内指定位置，否则脚本无法正常运行，如图所示：', 'red');
                                logs.addLog(
                                    '<img src="http://pan-yz.chaoxing.com/favicon.ico">'
                                );
                                stop = true;
                            } else {
                                logs.addLog('阅读文档失败', 'red');
                                logs.addLog('错误原因：' + err.error, 'red');
                            }
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        }
                    });
                }, parseInt(Math.random() * 2000 + 9000, 10))
            },
            doWork = (item) => {
                missionList['m' + item['jobid']]['running'] = true;
                logs.addLog('开始刷章节测试：' + item['name']);
                logs.addLog('DANIEL提醒你：如果脚本答题功能异常，请 <a href="https://scriptcat.org/zh-CN/script-show-page/1701" target="_blank">点击这里</a> 查看更换token方法', 'red');
                logs.addLog('您设置的答题正确率为：' + String(accuracy) + '%，只有在高于此正确率时才会提交测试', 'brown');
                _d.getElementById('workPanel').style.display = 'block';
                _d.getElementById('frame_content').src = _p + '//' + _h + '/work/phone/work?workId=' + item['jobid']
                    .replace('work-', '') + '&courseId=' + courseId + '&clazzId=' + classId + '&knowledgeId=' +
                    chapterId + '&jobId=' + item['jobid'] + '&enc=' + item['enc'];
                _w.top.unrivalWorkInfo = '';
                _w.top.unrivalDoneWorkId = '';
                setInterval(function () {
                    if (_w.top.unrivalWorkInfo != '') {
                        logs.addLog(_w.top.unrivalWorkInfo);
                        _w.top.unrivalWorkInfo = '';
                    }
                }, 100);
                let checkcross = setInterval(function () {
                    if (_w.top.unrivalWorkDone == false) {
                        clearInterval(checkcross);
                        return;
                    }
                    let ifW = _d.getElementById('frame_content').contentWindow;
                    try {
                        ifW.location.href;
                    } catch (e) {
                        console.log(e);
                        if (e.message.indexOf('cross-origin') != -1) {
                            clearInterval(checkcross);
                            _w.top.unrivalWorkDone = true;
                            return;
                        }
                    }
                }, 2000);
                let workDoneInterval = setInterval(function () {
                    if (_w.top.unrivalWorkDone) {
                        _w.top.unrivalWorkDone = false;
                        clearInterval(workDoneInterval);
                        _w.top.unrivalDoneWorkId = '';
                        _d.getElementById('workPanel').style.display = 'none';
                        _d.getElementById('frame_content').src = '';
                        setTimeout(function () {
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        }, 5000);
                    }
                }, 500);
            },
            missionList = [];
        if (jobList.length <= 0) {
            if (jumpType != 2) {
                _w.top.jump = true;
                logs.addLog('此页无任务，5秒后自动下一章', 'green');
            } else {
                logs.addLog('此页无任务，用户设置为不跳转，脚本已结束运行，如需自动跳转，请编辑脚本代码参数', 'green');
            }
            return;
        }
        for (let i = 0, l = jobList.length; i < l; i++) {
            let item = jobList[i];
            if (item['type'] == 'video') {
                video_getReady(item);
            } else if (item['type'] == 'document') {
                missionList['m' + item['jobid']] = {
                    'type': 'document',
                    'jtoken': item['jtoken'],
                    'jobid': item['jobid'],
                    'name': item['property']['name'],
                    'done': false,
                    'running': false
                };
                _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[文档]' + item['property']['name'] + `
                                </div>
                            </div>`
            } else if (item['type'] == 'workid' && _w.top.unrivalDoWork == '1') {
                missionList['m' + item['jobid']] = {
                    'type': 'work',
                    'workid': item['property']['workid'],
                    'jobid': item['jobid'],
                    'name': item['property']['title'],
                    'enc': item['enc'],
                    'done': false,
                    'running': false
                };
                _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[章节测试]' + item['property']['title'] + `
                                </div>
                            </div>`
            } else {
                try {
                    let jobName = item['property']['name'];
                    if (jobName == undefined) {
                        jobName = item['property']['title'];
                    }
                    _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '已跳过：' + jobName + `
                                </div>
                            </div>`
                } catch (e) { }
            }
        }
        loopjob();
    } else if (_l.href.includes("mycourse/studentstudy")) {
        var audiofile =
            'data:audio/ogg;base64,T2dnUwACAAAAAAAAAABwRPFFAAAAAGFtEqwBHgF2b3JiaXMAAAAAAUAfAAAAAAAAUHgAAAAAAACZAU9nZ1MAAAAAAAAAAAAAcETxRQEAAAA7J4IBDP8F////////////tQN2b3JiaXMvAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAxNDAxMjIgKFR1cnBha8OkcsOkamlpbikGAAAAJQAAAEVOQ09ERVI9U291bmQgU3R1ZGlvLCBsaWJWb3JiaXMgMS4zLjEbAAAAQUxCVU0gQVJUSVNUPUFkdmVudHVyZSBMYW5kFAAAAEFMQlVNPUFkdmVudHVyZSBMYW5kIQAAAEVOQ09ESU5HIEFQUExJQ0FUSU9OPVNvdW5kIFN0dWRpbxUAAABBUlRJU1Q9QWR2ZW50dXJlIExhbmQjAAAAVElUTEU9RW1wdHkgTG9vcCBGb3IgSlMgUGVyZm9ybWFuY2UBBXZvcmJpcxJCQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBADIAAAYhiGH3knMkFOQSSYpVcw5CKH1DjnlFGTSUsaYYoxRzpBTDDEFMYbQKYUQ1E45pQwiCENInWTOIEs96OBi5zgQGrIiAIgCAACMQYwhxpBzDEoGIXKOScggRM45KZ2UTEoorbSWSQktldYi55yUTkompbQWUsuklNZCKwUAAAQ4AAAEWAiFhqwIAKIAABCDkFJIKcSUYk4xh5RSjinHkFLMOcWYcowx6CBUzDHIHIRIKcUYc0455iBkDCrmHIQMMgEAAAEOAAABFkKhISsCgDgBAIMkaZqlaaJoaZooeqaoqqIoqqrleabpmaaqeqKpqqaquq6pqq5seZ5peqaoqp4pqqqpqq5rqqrriqpqy6ar2rbpqrbsyrJuu7Ks256qyrapurJuqq5tu7Js664s27rkearqmabreqbpuqrr2rLqurLtmabriqor26bryrLryratyrKua6bpuqKr2q6purLtyq5tu7Ks+6br6rbqyrquyrLu27au+7KtC7vourauyq6uq7Ks67It67Zs20LJ81TVM03X9UzTdVXXtW3VdW1bM03XNV1XlkXVdWXVlXVddWVb90zTdU1XlWXTVWVZlWXddmVXl0XXtW1Vln1ddWVfl23d92VZ133TdXVblWXbV2VZ92Vd94VZt33dU1VbN11X103X1X1b131htm3fF11X11XZ1oVVlnXf1n1lmHWdMLqurqu27OuqLOu+ruvGMOu6MKy6bfyurQvDq+vGseu+rty+j2rbvvDqtjG8um4cu7Abv+37xrGpqm2brqvrpivrumzrvm/runGMrqvrqiz7uurKvm/ruvDrvi8Mo+vquirLurDasq/Lui4Mu64bw2rbwu7aunDMsi4Mt+8rx68LQ9W2heHVdaOr28ZvC8PSN3a+AACAAQcAgAATykChISsCgDgBAAYhCBVjECrGIIQQUgohpFQxBiFjDkrGHJQQSkkhlNIqxiBkjknIHJMQSmiplNBKKKWlUEpLoZTWUmotptRaDKG0FEpprZTSWmopttRSbBVjEDLnpGSOSSiltFZKaSlzTErGoKQOQiqlpNJKSa1lzknJoKPSOUippNJSSam1UEproZTWSkqxpdJKba3FGkppLaTSWkmptdRSba21WiPGIGSMQcmck1JKSamU0lrmnJQOOiqZg5JKKamVklKsmJPSQSglg4xKSaW1kkoroZTWSkqxhVJaa63VmFJLNZSSWkmpxVBKa621GlMrNYVQUgultBZKaa21VmtqLbZQQmuhpBZLKjG1FmNtrcUYSmmtpBJbKanFFluNrbVYU0s1lpJibK3V2EotOdZaa0ot1tJSjK21mFtMucVYaw0ltBZKaa2U0lpKrcXWWq2hlNZKKrGVklpsrdXYWow1lNJiKSm1kEpsrbVYW2w1ppZibLHVWFKLMcZYc0u11ZRai621WEsrNcYYa2415VIAAMCAAwBAgAlloNCQlQBAFAAAYAxjjEFoFHLMOSmNUs45JyVzDkIIKWXOQQghpc45CKW01DkHoZSUQikppRRbKCWl1losAACgwAEAIMAGTYnFAQoNWQkARAEAIMYoxRiExiClGIPQGKMUYxAqpRhzDkKlFGPOQcgYc85BKRljzkEnJYQQQimlhBBCKKWUAgAAChwAAAJs0JRYHKDQkBUBQBQAAGAMYgwxhiB0UjopEYRMSielkRJaCylllkqKJcbMWomtxNhICa2F1jJrJcbSYkatxFhiKgAA7MABAOzAQig0ZCUAkAcAQBijFGPOOWcQYsw5CCE0CDHmHIQQKsaccw5CCBVjzjkHIYTOOecghBBC55xzEEIIoYMQQgillNJBCCGEUkrpIIQQQimldBBCCKGUUgoAACpwAAAIsFFkc4KRoEJDVgIAeQAAgDFKOSclpUYpxiCkFFujFGMQUmqtYgxCSq3FWDEGIaXWYuwgpNRajLV2EFJqLcZaQ0qtxVhrziGl1mKsNdfUWoy15tx7ai3GWnPOuQAA3AUHALADG0U2JxgJKjRkJQCQBwBAIKQUY4w5h5RijDHnnENKMcaYc84pxhhzzjnnFGOMOeecc4wx55xzzjnGmHPOOeecc84556CDkDnnnHPQQeicc845CCF0zjnnHIQQCgAAKnAAAAiwUWRzgpGgQkNWAgDhAACAMZRSSimllFJKqKOUUkoppZRSAiGllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimVUkoppZRSSimllFJKKaUAIN8KBwD/BxtnWEk6KxwNLjRkJQAQDgAAGMMYhIw5JyWlhjEIpXROSkklNYxBKKVzElJKKYPQWmqlpNJSShmElGILIZWUWgqltFZrKam1lFIoKcUaS0qppdYy5ySkklpLrbaYOQelpNZaaq3FEEJKsbXWUmuxdVJSSa211lptLaSUWmstxtZibCWlllprqcXWWkyptRZbSy3G1mJLrcXYYosxxhoLAOBucACASLBxhpWks8LR4EJDVgIAIQEABDJKOeecgxBCCCFSijHnoIMQQgghREox5pyDEEIIIYSMMecghBBCCKGUkDHmHIQQQgghhFI65yCEUEoJpZRSSucchBBCCKWUUkoJIYQQQiillFJKKSGEEEoppZRSSiklhBBCKKWUUkoppYQQQiillFJKKaWUEEIopZRSSimllBJC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',
            audioPlayer = new Audio(audiofile);
        _w.top.backNow = 0;
        audioPlayer.loop = true;
        _w.audioPlayer = audioPlayer;
        setInterval(function () {
            try {
                _w.jQuery.fn.viewer.Constructor.prototype.show = () => { };
            } catch (e) {
            }
        }, 1000);
        try {
            _w.unrivalScriptList.push('Fuck me please');
        } catch (e) {
            _w.unrivalScriptList = ['Fuck me please'];
        }
         
        function checkOffline() {
            let dleft = _d.getElementsByClassName('left');
            if (dleft.length == 1) {
                let img = dleft[0].getElementsByTagName('img');
                if (img.length == 1) {
                    if (img[0].src.indexOf('loading.gif') != -1) {
                        return true;
                    }
                }
            }
            return false;
        }
        setInterval(function () {
            if (checkOffline()) {
                setTimeout(function () {
                    if (checkOffline()) {
                        _l.reload();
                    }
                }, 10000)
            }
        }, 3000);
        _d.addEventListener('visibilitychange', function () {
            var c = 0;
            if (_w.top.backNow == 0) {
                _d.title = '⚠️请先激活挂机';
                return
            } else {
                _d.title = '学生学习页面';
            }
            if (_d.hidden) {
                audioPlayer.play();
                var timer = setInterval(function () {
                    if (c) {
                        _d.title = '挂机中';
                        c = 0;
                    } else {
                        _d.title = '挂机中';
                        c = 1;
                    }
                    if (!_d.hidden) {
                        clearInterval(timer);
                        _d.title = '学生学习页面';
                    }
                }, 1300);
            } else {
                audioPlayer.pause();
            }
        });
        _w.unrivalgetTeacherAjax = _w.getTeacherAjax;
        _w.getTeacherAjax = (courseid, classid, cid) => {
            if (cid == getQueryVariable('chapterId')) {
                return;
            }
            _w.top.unrivalPageRd = '';
            _w.unrivalgetTeacherAjax(courseid, classid, cid);
        }
        if (disableMonitor == 1) {
            _w.appendChild = _w.Element.prototype.appendChild;
            _w.Element.prototype.appendChild = function () {
                try {
                    if (arguments[0].src.indexOf('detect.chaoxing.com') > 0) {
                        return;
                    }
                } catch (e) { }
                _w.appendChild.apply(this, arguments);
            };
        }

        _w.jump = false;
        setInterval(function () {
            if (getQueryVariable('mooc2') == '1') {
                let tabs = _d.getElementsByClassName('posCatalog_select');
                for (let i = 0, l = tabs.length; i < l; i++) {
                    let tabId = tabs[i].getAttribute('id');
                    if (tabId.indexOf('cur') >= 0 && tabs[i].getAttribute('class') == 'posCatalog_select') {
                        tabs[i].setAttribute('onclick', "getTeacherAjax('" + courseId + "','" + classId +
                            "','" + tabId.replace('cur', '') + "');");
                    }
                }
            } else {
                let h4s = _d.getElementsByTagName('h4'),
                    h5s = _d.getElementsByTagName('h5');
                for (let i = 0, l = h4s.length; i < l; i++) {
                    if (h4s[i].getAttribute('id').indexOf('cur') >= 0) {
                        h4s[i].setAttribute('onclick', "getTeacherAjax('" + courseId + "','" + classId +
                            "','" + h4s[i].getAttribute('id').replace('cur', '') + "');");
                    }
                }
                for (let i = 0, l = h5s.length; i < l; i++) {
                    if (h5s[i].getAttribute('id').indexOf('cur') >= 0) {
                        h5s[i].setAttribute('onclick', "getTeacherAjax('" + courseId + "','" + classId +
                            "','" + h5s[i].getAttribute('id').replace('cur', '') + "');");
                    }
                }
            }
        }, 1000);
        setInterval(function () {
            let but = null;
            if (_w.jump) {
                _w.jump = false;
                _w.top.unrivalDoneWorkId = '';
                _w.jjump = (rd) => {
                    if (rd != _w.top.unrivalPageRd) {
                        return;
                    }
                    try {
                        setTimeout(function () {
                            if (jumpType == 1) {
                                if (getQueryVariable('mooc2') == '1') {
                                    but = _d.getElementsByClassName(
                                        'jb_btn jb_btn_92 fs14 prev_next next');
                                } else {
                                    but = _d.getElementsByClassName('orientationright');
                                }
                                try {
                                    setTimeout(function () {
                                        if (rd != _w.top.unrivalPageRd) {
                                            return;
                                        }
                                        but[0].click();
                                    }, 2000);
                                } catch (e) { }
                                return;
                            }
                            if (getQueryVariable('mooc2') == '1') {
                                let ul = _d.getElementsByClassName('prev_ul')[0],
                                    lis = ul.getElementsByTagName('li');
                                for (let i = 0, l = lis.length; i < l; i++) {
                                    if (lis[i].getAttribute('class') == 'active') {
                                        if (i + 1 >= l) {
                                            break;
                                        } else {
                                            try {
                                                lis[i + 1].click();
                                            } catch (e) { }
                                            return;
                                        }
                                    }
                                }
                                let tabs = _d.getElementsByClassName('posCatalog_select');
                                for (let i = 0, l = tabs.length; i < l; i++) {
                                    if (tabs[i].getAttribute('class') ==
                                        'posCatalog_select posCatalog_active') {
                                        while (i + 1 < tabs.length) {
                                            let nextTab = tabs[i + 1];
                                            if ((nextTab.innerHTML.includes(
                                                'icon_Completed prevTips') && _w.top
                                                    .unrivalReviewMode == '0') || nextTab
                                                        .innerHTML.includes(
                                                            'catalog_points_er prevTips')) {
                                                i++;
                                                continue;
                                            }
                                            if (nextTab.id.indexOf('cur') < 0) {
                                                i++;
                                                continue;
                                            }
                                            let clickF = setInterval(function () {
                                                if (rd != _w.top.unrivalPageRd) {
                                                    clearInterval(clickF);
                                                    return;
                                                }
                                                nextTab.click();
                                            }, 2000);
                                            break;
                                        }
                                        break;
                                    }
                                }
                            } else {
                                let div = _d.getElementsByClassName('tabtags')[0],
                                    spans = div.getElementsByTagName('span');
                                for (let i = 0, l = spans.length; i < l; i++) {
                                    if (spans[i].getAttribute('class').indexOf('currents') >=
                                        0) {
                                        if (i + 1 == l) {
                                            break;
                                        } else {
                                            try {
                                                spans[i + 1].click();
                                            } catch (e) { }
                                            return;
                                        }
                                    }
                                }
                                let tabs = _d.getElementsByTagName('span'),
                                    newTabs = [];
                                for (let i = 0, l = tabs.length; i < l; i++) {
                                    if (tabs[i].getAttribute('style') != null && tabs[i]
                                        .getAttribute('style').indexOf(
                                            'cursor:pointer;height:18px;') >= 0) {
                                        newTabs.push(tabs[i]);
                                    }
                                }
                                tabs = newTabs;
                                for (let i = 0, l = tabs.length; i < l; i++) {
                                    if (tabs[i].parentNode.getAttribute('class') ==
                                        'currents') {
                                        while (i + 1 < tabs.length) {
                                            let nextTab = tabs[i + 1].parentNode;
                                            if ((nextTab.innerHTML.includes(
                                                'roundpoint  brown') && _w.top
                                                    .unrivalReviewMode == '0') || nextTab
                                                        .innerHTML.includes('roundpointStudent  lock')
                                            ) {
                                                i++;
                                                continue;
                                            }
                                            if (nextTab.id.indexOf('cur') < 0) {
                                                i++;
                                                continue;
                                            }
                                            let clickF = setInterval(function () {
                                                if (rd != _w.top.unrivalPageRd) {
                                                    clearInterval(clickF);
                                                    return;
                                                }
                                                nextTab.click();
                                            }, 2000);
                                            break;
                                        }
                                        break;
                                    }
                                }
                            }
                        }, 2000);
                    } catch (e) { }
                }
                _w.onReadComplete1();
                setTimeout('jjump("' + _w.top.unrivalPageRd + '")', 2856);
            }
        }, 200);
    } else if (_l.href.indexOf("work/phone/doHomeWork") > 0) {
        var wIdE = _d.getElementById('workLibraryId') || _d.getElementById('oldWorkId'),
            wid = wIdE.value;
        _w.top.unrivalWorkDone = false;
        _w.aalert = _w.alert;
        _w.alert = (msg) => {
            if (msg == '保存成功') {
                _w.top.unrivalDoneWorkId = getQueryVariable('workId');
                return;
            }
            aalert(msg);
        }
        if (_w.top.unrivalDoneWorkId == getQueryVariable('workId')) {
            _w.top.unrivalWorkDone = true;
            return;
        }
        _w.confirm = (msg) => {
            return true;
        }
        var questionList = [],
            questionsElement = _d.getElementsByClassName('Py-mian1'),
            questionNum = questionsElement.length,
            totalQuestionNum = questionNum;
        for (let i = 0; i < questionNum; i++) {
            let questionElement = questionsElement[i],
                idElements = questionElement.getElementsByTagName('input'),
                questionId = '0',
                question = questionElement.getElementsByClassName('Py-m1-title fs16')[0].innerHTML;
            question = handleImgs(question).replace(/(<([^>]+)>)/ig, '').replace(/[0-9]{1,3}.\[(.*?)\]/ig, '').replaceAll('\n',
                '').replace(/^\s+/ig, '').replace(/\s+$/ig, '');
            for (let z = 0, k = idElements.length; z < k; z++) {
                try {
                    if (idElements[z].getAttribute('name').indexOf('answer') >= 0) {
                        questionId = idElements[z].getAttribute('name').replace('type', '');
                        break;
                    }
                } catch (e) {
                    console.log(e);
                    continue;
                }
            }
            if (questionId == '0' || question == '') {
                continue;
            }
            typeE = questionElement.getElementsByTagName('input');
            if (typeE == null || typeE == []) {
                continue;
            }
            let typeN = 'fuckme';
            for (let g = 0, h = typeE.length; g < h; g++) {
                if (typeE[g].id == 'answertype' + questionId.replace('answer', '').replace('check', '')) {
                    typeN = typeE[g].value;
                    break;
                }
            }
            if (['0', '1', '3'].indexOf(typeN) < 0) {
                continue;
            }
            type = {
                '0': '单选题',
                '1': '多选题',
                '3': '判断题'
            }[typeN];
            let optionList = {
                length: 0
            };
            if (['单选题', '多选题'].indexOf(type) >= 0) {
                let answersElements = questionElement.getElementsByClassName('answerList')[0].getElementsByTagName(
                    'li');
                for (let x = 0, j = answersElements.length; x < j; x++) {
                    let optionE = answersElements[x],
                        optionTextE = trim(optionE.innerHTML.replace(/(^\s*)|(\s*$)/g, "")),
                        optionText = optionTextE.slice(1).replace(/(^\s*)|(\s*$)/g, ""),
                        optionValue = optionTextE.slice(0, 1),
                        optionId = optionE.getAttribute('id-param');
                    if (optionText == '') {
                        break;
                    }
                    optionList[optionText] = {
                        'id': optionId,
                        'value': optionValue
                    }
                    optionList.length++;
                }
                if (answersElements.length != optionList.length) {
                    continue;
                }
            }
            questionList.push({
                'question': question,
                'type': type,
                'questionid': questionId,
                'options': optionList
            });
        }
        var qu = null,
            nowTime = -4000,
            busyThread = questionList.length,
            ctOnload = function (res, quu) {
                busyThread -= 1;
                var ctResult = {
                    'code': -1,
                    'finalUrl': '',
                    'data': '未找到答案'
                };
                if (res) {
                    try {
                        var responseText = res.responseText,
                            ctResult = JSON.parse(responseText);
                    } catch (e) {
                        console.log(e);
                        if (res.finalUrl.includes('getAnswer.php')) {
                            _w.top.unrivalWorkInfo = 'DANIEL提醒你：查题错误，服务器连接失败';
                            return;
                        }
                    }
                }
                try {
                    let choiceEs = _d.getElementsByTagName('li');
                    if (ctResult['code'] == -1 ) {
                        try {
                            if (ctResult['msg'] !== undefined) {
                                _w.top.unrivalWorkInfo = ctResult['msg'] ;
                            }
                        } catch (e) { }
                        busyThread += 1;
                        GM_xmlhttpRequest({
                            method: "GET",
                            headers: {
                                'Authorization': token,
                            },
                            timeout: 6000,
                            url: host + 'chaoXing/v3/getAnswer.php?tm=' + encodeURIComponent(quu['question']
                                .replace(/(^\s*)|(\s*$)/g, '')) + '&type=' + {
                                    '单选题': '0',
                                    '多选题': '1',
                                    '判断题': '3'
                                }[quu['type']] + '&wid=' + wid + '&courseid=' + courseId,
                            onload: function (res) {
                                ctOnload(res, quu);
                            },
                            onerror: function (err) {
                                _w.top.unrivalWorkInfo = '查题错误，服务器连接失败';
                                console.log(err);
                                busyThread -= 1;
                            },
                            ontimeout: function (err) {
                                _w.top.unrivalWorkInfo = '查题错误，服务器连接失败';
                                console.log(err);
                                busyThread -= 1;
                            }
                        });
                        return;
                    }
                    try {
                        var result = ctResult['data'];
                    } catch (e) {
                        _w.top.unrivalWorkInfo = '答案解析失败';
                        return;
                    }
                    _w.top.unrivalWorkInfo = '题目：' + quu['question'] + '：' + result;
                    switch (quu['type']) {
                        case '判断题':
                            (function () {
                                let answer = 'abaabaaba';
                                if ('正确是对√Tri'.indexOf(result) >= 0) {
                                    answer = 'true';
                                } else if ('错误否错×Fwr'.indexOf(result) >= 0) {
                                    answer = 'false';
                                }
                                for (let u = 0, k = choiceEs.length; u < k; u++) {
                                    if (choiceEs[u].getAttribute('val-param') ==
                                        answer && choiceEs[u].getAttribute(
                                            'id-param') == quu['questionid'].replace(
                                                'answer', '')) {
                                        choiceEs[u].click();
                                        questionNum -= 1;
                                        return;
                                    }
                                }
                                if (randomDo == 1 && accuracy < 100) {
                                    _w.top.unrivalWorkInfo = quu['question'] +
                                        '：未找到正确答案，自动选【错】';
                                    for (let u = 0, k = choiceEs.length; u <
                                        k; u++) {
                                        if (choiceEs[u].getElementsByTagName('em')
                                            .length < 1) {
                                            continue;
                                        }
                                        if (choiceEs[u].getAttribute('val-param') ==
                                            'false' && choiceEs[u].getAttribute(
                                                'id-param') == quu['questionid']
                                                    .replace('answer', '')) {
                                            choiceEs[u].click();
                                            return;
                                        }
                                    }
                                }
                            })();
                            break;
                        case '单选题':
                            (function () {
                                let answerData = result;
                                for (let option in quu['options']) {
                                    if (trim(option).replace(/\s/ig, '') == trim(answerData).replace(/\s/ig, '') || trim(
                                        option).replace(/\s/ig, '').includes(trim(answerData).replace(/\s/ig, '')) ||
                                        trim(answerData).replace(/\s/ig, '').includes(trim(option).replace(/\s/ig, ''))) {
                                        for (let y = 0, j = choiceEs.length; y <
                                            j; y++) {
                                            if (choiceEs[y].getElementsByTagName(
                                                'em').length < 1) {
                                                continue;
                                            }
                                            if (choiceEs[y].getElementsByTagName(
                                                'em')[0].getAttribute(
                                                    'id-param') == quu['options'][
                                                    option
                                                    ]['value'] && choiceEs[y]
                                                        .getAttribute('id-param') == quu[
                                                            'questionid'].replace('answer',
                                                                '')) {
                                                if (!choiceEs[y].getAttribute(
                                                    'class').includes('cur')) {
                                                    choiceEs[y].click();
                                                }
                                                questionNum -= 1;
                                                return;
                                            }
                                        }
                                    }
                                }
                                if (randomDo == 1 && accuracy < 100) {
                                    _w.top.unrivalWorkInfo = quu['question'] +
                                        '：未找到正确答案，自动选【B】';
                                    for (let y = 0, j = choiceEs.length; y <
                                        j; y++) {
                                        if (choiceEs[y].getElementsByTagName('em')
                                            .length < 1) {
                                            continue;
                                        }
                                        if (choiceEs[y].getElementsByTagName('em')[
                                            0].getAttribute('id-param') ==
                                            'B' && choiceEs[y].getAttribute(
                                                'id-param') == quu['questionid']
                                                    .replace('answer', '')) {
                                            if (!choiceEs[y].getAttribute('class')
                                                .includes('cur')) {
                                                choiceEs[y].click();
                                            }
                                            return;
                                        }
                                    }
                                }
                            })();
                            break;
                        case '多选题':
                            (function () {
                                let answerData = trim(result).replace(/\s/ig, ''),
                                    hasAnswer = false;
                                for (let option in quu['options']) {
                                    if (answerData.includes(trim(option).replace(/\s/ig, ''))) {
                                        for (let y = 0, j = choiceEs.length; y <
                                            j; y++) {
                                            if (choiceEs[y].getElementsByTagName(
                                                'em').length < 1) {
                                                continue;
                                            }
                                            if (choiceEs[y].getElementsByTagName(
                                                'em')[0].getAttribute(
                                                    'id-param') == quu['options'][
                                                    option
                                                    ]['value'] && choiceEs[y]
                                                        .getAttribute('id-param') == quu[
                                                            'questionid'].replace('answer',
                                                                '')) {
                                                if (!choiceEs[y].getAttribute(
                                                    'class').includes('cur')) {
                                                    choiceEs[y].click();
                                                }
                                                hasAnswer = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (hasAnswer) {
                                    questionNum -= 1;
                                } else if (randomDo == 1 && accuracy < 100) {
                                    _w.top.unrivalWorkInfo = quu['question'] +
                                        '：未找到正确答案，自动全选';
                                    for (let y = 0, j = choiceEs.length; y <
                                        j; y++) {
                                        if (choiceEs[y].getElementsByTagName('em')
                                            .length < 1) {
                                            continue;
                                        }
                                        if (choiceEs[y].getAttribute('id-param') ==
                                            quu['questionid'].replace('answer', '')
                                        ) {
                                            if (!choiceEs[y].getAttribute('class')
                                                .includes('cur')) {
                                                choiceEs[y].click();
                                            }
                                        }
                                    }
                                }
                            })();
                            break;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        for (let i = 0, l = questionList.length; i < l; i++) {
            nowTime += parseInt(Math.random() * 2000 + 2500, 10);
            setTimeout(function () {
                qu = questionList[i];
                let param = 'question=' + encodeURIComponent(
                    qu['question']);
                if (ctUrl.includes('icodef')) {
                    param += '&type=' + {
                        '单选题': '0',
                        '多选题': '1',
                        '判断题': '3'
                    }[qu['type']] + '&id=' + wid;
                }
                GM_xmlhttpRequest({
                    method: "POST",
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Authorization': token,
                    },
                    url: ctUrl,
                    timeout: 2000,
                    data: param,
                    onload: function (res) {
                        ctOnload(res, qu);
                    },
                    onerror: function () {
                        ctOnload(false, qu);
                    },
                    ontimeout: function () {
                        ctOnload(false, qu);
                    }
                });
            }, nowTime);
        }
        var workInterval = setInterval(function () {
            if (busyThread != 0) {
                return;
            }
            clearInterval(workInterval);
            if (Math.floor((totalQuestionNum - questionNum) / totalQuestionNum) * 100 >= accuracy && _w.top
                .unrivalAutoSubmit == '1') {
                _w.top.unrivalDoneWorkId = getQueryVariable('workId');
                _w.top.unrivalWorkInfo = '正确率符合标准，已提交答案';
                setTimeout(function () {
                    submitCheckTimes();
                    escapeBlank()
                    submitAction()
                    //	setTimeout(function() {
                    //          document.querySelector(".cx_alert-brown").click()
                    //	}, parseInt(1000));
                }, parseInt(Math.random() * 2000 + 3000, 10));

            } else if (_w.top.unrivalAutoSave == 1) {
                _w.top.unrivalWorkInfo = '正确率不符合标准或未设置自动提交，已自动保存答案';
                if (Math.floor((totalQuestionNum - questionNum) / totalQuestionNum) >= 0) {
                    setTimeout(function () {
                        _w.top.unrivalDoneWorkId = getQueryVariable('workId');
                        _w.noSubmit();
                    }, 2000);
                }
            } else {
                _w.top.unrivalWorkInfo = '用户设置为不自动保存答案，请手动提交或保存作业';
            }
        }, 1000);
    } else if (_l.href.includes('work/phone/selectWorkQuestionYiPiYue')) {
        _w.top.unrivalWorkDone = true;
        _w.top.unrivalDoneWorkId = getQueryVariable('workId');
    } else if (_l.href.includes('stat2-ans.chaoxing.com/task/s/index')) {
        if (_w.top == _w) {
            return;
        }
        _d.getElementsByClassName('page-container studentStatistic')[0].setAttribute('class', 'studentStatistic');
        _d.getElementsByClassName('page-item item-task-list minHeight390')[0].remove();
        _d.getElementsByClassName('subNav clearfix')[0].remove();
        setInterval(function () {
            _l.reload();
        }, 90000);
    } else if (_l.href.includes('passport2.') && _l.href.includes('login?refer=http') && autoLogin == 1) {
        if (!(/^1[3456789]\d{9}$/.test(phoneNumber))) {
            alert('自动登录的手机号填写错误，无法登陆')
            return;
        }
        if (password == '') {
            alert('未填写登录密码，无法登陆')
            return;
        }
        GM_xmlhttpRequest({
            method: "get",
            url: 'https://passport2-api.chaoxing.com/v11/loginregister?cx_xxt_passport=json&uname=' +
                phoneNumber + '&code=' + encodeURIComponent(password),
            onload: function (res) {
                try {
                    let ispass = JSON.parse(res.responseText);
                    if (ispass['status']) {
                        _l.href = decodeURIComponent(getQueryVariable('refer'));
                    } else {
                        alert(ispass['mes']);
                    }
                } catch (err) {
                    console.log(res.responseText);
                    alert('登陆失败');
                }
            },
            onerror: function (err) {
                alert('登陆错误');
            }
        });
    } else if (_l.href.includes('unrivalxxtbackground')) {
        _d.getElementsByTagName("html")[0].innerHTML = `
    <!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>学习通挂机小助手</title>
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
        <link href="https://z.chaoxing.com/yanshi/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="row" style="margin: 10px;">
            <div class="col-md-6 col-md-offset-3">
                <div class="header clearfix">
                    <h3 class="text-muted" style="margin-top: 20px;margin-bottom: 0;float: left;">学习通挂机小助手&ensp;</h3>
                </div>
                <hr style="margin-top: 10px;margin-bottom: 20px;">
                <div class="panel panel-info">
                    <div class="panel-heading">任务列表</div>
                    <div class="panel-body" id='joblist'>
                    </div>
                </div>
                <div class="panel panel-info">
                    <div class="panel-heading">运行日志</div>
                    <div class="panel-body">
                        <div id="result" style="overflow:auto;line-height: 30px;">
                            <div id="log">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
    `;
        var logs = {
            "logArry": [],
            "addLog": function (str, color = "black") {
                if (this.logArry.length >= 50) {
                    this.logArry.splice(0, 1);
                }
                var nowTime = new Date(),
                    nowHour = (Array(2).join(0) + nowTime.getHours()).slice(-2),
                    nowMin = (Array(2).join(0) + nowTime.getMinutes()).slice(-2),
                    nowSec = (Array(2).join(0) + nowTime.getSeconds()).slice(-2),
                    logElement = _d.getElementById('log'),
                    logStr = "";
                this.logArry.push("<span style='color: " + color + "'>[" + nowHour + ":" + nowMin + ":" +
                    nowSec + "] " + str + "</span>");
                for (let logI = 0, logLen = this.logArry.length; logI < logLen; logI++) {
                    logStr += this.logArry[logI] + "<br>";
                }
                _d.getElementById('log').innerHTML = logStr;
                logElement.scrollTop = logElement.scrollHeight;
            }
        };
        logs.addLog('此页面不必保持在最前端，后台会自动进行任务', 'green');
        setInterval(function () {
            logs.addLog('此页面不必保持在最前端，后台会自动进行任务', 'green');
            logs.addLog('如想禁用后台刷视频功能，请关闭脚本并重启浏览器', 'brown');
        }, 120000)
        GM_addValueChangeListener('unrivalxxtbackgroundinfo', function (name, old_value, new_value, remote) {
            if (old_value != new_value) {
                logs.addLog(new_value);
            }
        });
        setInterval(function () {
            if (Math.round(new Date() / 1000) - parseInt(GM_getValue('unrivalBackgroundVideoEnable', '6')) >
                15) {
                logs.addLog('超星挂机小助手可能运行异常，如页面无反应，请尝试重启浏览器');
            }
        }, 10000);
        var loopShow = () => {
            let jobList = GM_getValue('unrivalBackgroundList', '1');
            if (jobList == '1') {
                _d.getElementById('joblist').innerHTML = '请将“超星挂机小助手”升级到最新版并重启浏览器';
            } else {
                try {
                    let jobHtml = '';
                    for (let i = 0, l = jobList.length; i < l; i++) {
                        let status = '';
                        if (jobList[i]['done']) {
                            status = '已完成';
                        } else if (parseInt(jobList[i]['playTime']) > 0) {
                            status = '进行中';
                        } else {
                            status = '等待中';
                        }
                        if (jobList[i]['review']) {
                            status += '：复习模式';
                        }
                        jobHtml += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[' + status + ']' + jobList[i]['name'] + `
                                </div>
                            </div>`
                    }
                    _d.getElementById('joblist').innerHTML = jobHtml;
                } catch (e) {
                    _d.getElementById('joblist').innerHTML = '请将“超星挂机小助手”升级到最新版并重启浏览器！';
                }
            }
        }
        loopShow();
        setInterval(loopShow, 10000);
    }
})();