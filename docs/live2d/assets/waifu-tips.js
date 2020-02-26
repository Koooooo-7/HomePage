window.live2d_settings = Array();
// 工具栏设置
live2d_settings['showToolMenu']         = false;         // 显示 工具栏          ，可选 true(真), false(假)
// live2d_settings['canCloseLive2d']       = true;         // 显示 关闭看板娘  按钮，可选 true(真), false(假)
// live2d_settings['canSwitchModel']       = true;         // 显示 模型切换    按钮，可选 true(真), false(假)
// live2d_settings['canSwitchTextures']    = true;         // 显示 材质切换    按钮，可选 true(真), false(假)
// live2d_settings['canSwitchHitokoto']    = true;         // 显示 一言切换    按钮，可选 true(真), false(假)
// live2d_settings['canTakeScreenshot']    = true;         // 显示 看板娘截图  按钮，可选 true(真), false(假)
// live2d_settings['canTurnToHomePage']    = true;         // 显示 返回首页    按钮，可选 true(真), false(假)
// live2d_settings['canTurnToAboutPage']   = true;         // 显示 跳转关于页  按钮，可选 true(真), false(假)
// live2d_settings['showCopyMessage']      = true;         // 显示 复制内容 提示



String.prototype.render = function (context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;

    return this.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) {  
            return word.replace('\\', '');
        }

        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;

        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
};

var re = /x/;
re.toString = function() {
    showMessage('What are you looking for?', 5000, true);
    return '';
};

$(document).on('copy', function (){
    showMessage('<span style=\"color:#42b983;\"> Ctrl+C, Ctrl+V.~</span>', 5000, true);
});

$('.waifu-tool .fui-home').click(function (){
    window.location = window.location.protocol+'//'+window.location.hostname+'/'
});

$('.waifu-tool .fui-eye').click(function (){
    loadOtherModel();
});

$('.waifu-tool .fui-chat').click(function (){
    showHitokoto();
});

$('.waifu-tool .fui-user').click(function (){
    loadRandModel();
});

$('.waifu-tool .fui-info-circle').click(function (){
    //window.open('https://imjad.cn/archives/lab/add-dynamic-poster-girl-with-live2d-to-your-blog-02');
	 var SiteIndexUrl = window.location.protocol+'//'+window.location.hostname+'/';  // 自动获取主页
    window.open(SiteIndexUrl);
});

$('.waifu-tool .fui-cross').click(function (){
    sessionStorage.setItem('waifu-dsiplay', 'none');
    showMessage('Best regards to u.', 1300, true);
    window.setTimeout(function() {$('.waifu').hide();}, 1300);
});

$('.waifu-tool .fui-photo').click(function (){
    showMessage('Cute Cute~', 5000, true);
    window.Live2D.captureName = 'Pio.png';
    window.Live2D.captureFrame = true;
});

(function (){
    var text;
    //var SiteIndexUrl = 'https://www.example.com/';  // 手动指定主页
    var SiteIndexUrl = window.location.protocol+'//'+window.location.hostname+'/';  // 自动获取主页
    
    if (window.location.href == SiteIndexUrl) {      // 如果是主页
        var now = (new Date()).getHours();
        if (now > 23 || now <= 5) {
            text = 'It is time to sleep !';
        } else if (now > 5 && now <= 11) {
            text = 'Yo, morning !';
        } else if (now > 11 && now <= 14) {
            text = 'Yo, lunch time !';
        } else if (now > 14 && now <= 19) {
            text = 'Hey, wake up !';
        } else if (now > 21 && now <= 23) {
            text = 'Yo, night, night ~';
        } else {
            text = 'Give me a star, thx !';
        }
    } else {
        text = '<span style="color:#0099cc;">『Nice to meet u ! 』</span>';
    }
    showMessage(text, 6000);
})();

//window.hitokotoTimer = window.setInterval(showHitokoto,30000);
/* 检测用户活动状态，并在空闲时 定时显示一言 */
// var getActed = false;
// window.hitokotoTimer = 0;
// var hitokotoInterval = false;

// $(document).mousemove(function(e){getActed = true;}).keydown(function(){getActed = true;});
// setInterval(function() { if (!getActed) ifActed(); else elseActed(); }, 1000);

// function ifActed() {
//     if (!hitokotoInterval) {
//         hitokotoInterval = true;
//         hitokotoTimer = window.setInterval(showHitokoto, 30000);
//     }
// }

// function elseActed() {
//     getActed = hitokotoInterval = false;
//     window.clearInterval(hitokotoTimer);
// }

function showHitokoto(){
	/* 增加 hitokoto.cn API */
    $.getJSON('https://international.v1.hitokoto.cn/?c=a',function(result){
        var text = '{source} - 《{creator}》';
        text = text.render({source: result.hitokoto, creator: result.from});
        showMessage(text, 5000);
    });
	/*
	$.getJSON('https://api.fghrsh.net/hitokoto/rand/?encode=jsc&uid=3335',function(result){
        var text = '这句一言出处是 <span style="color:#0099cc;">『{source}』</span>，是 <span style="color:#0099cc;">FGHRSH</span> 在 {date} 收藏的！';
        text = text.render({source: result.source, date: result.date});
        showMessage(result.hitokoto, 5000);
        window.setTimeout(function() {showMessage(text, 3000);}, 5000);
    });
	*/
}

function showMessage(text, timeout, flag){
    if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        //console.log(text);
        
        if(flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout){
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === undefined) timeout = 5000;
    window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

function initModel(waifuPath){
    
    if (waifuPath === undefined) waifuPath = '';
    // var modelId = localStorage.getItem('modelId');
    // var modelTexturesId = localStorage.getItem('modelTexturesId');
    var modelId = 3
    var modelTexturesId = 48
    
    if (modelId == null) {
        
        /* 首次访问加载 指定模型 的 指定材质 */
        
        var modelId = 3;            // 模型 ID
        var modelTexturesId = 48    // 材质 ID
        
    } loadModel(modelId, modelTexturesId);
	
	$.ajax({
        cache: true,
        url: waifuPath+'waifu-tips.json',
        dataType: "json",
        success: function (result){
            $.each(result.mouseover, function (index, tips){
                $(document).on("mouseover", tips.selector, function (){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({text: $(this).text()});
                    showMessage(text, 3000);
                });
            });
            $.each(result.click, function (index, tips){
                $(document).on("click", tips.selector, function (){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({text: $(this).text()});
                    showMessage(text, 3000, true);
                });
            });
            $.each(result.seasons, function (index, tips){
                var now = new Date();
                var after = tips.date.split('-')[0];
                var before = tips.date.split('-')[1] || after;
                
                if((after.split('/')[0] <= now.getMonth()+1 && now.getMonth()+1 <= before.split('/')[0]) && 
                   (after.split('/')[1] <= now.getDate() && now.getDate() <= before.split('/')[1])){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({year: now.getFullYear()});
                    showMessage(text, 6000, true);
                }
            });
        }
    });
}

function loadModel(modelId, modelTexturesId){
    localStorage.setItem('modelId', modelId);
    if (modelTexturesId === undefined) modelTexturesId = 0;
    localStorage.setItem('modelTexturesId', modelTexturesId);
    loadlive2d('live2d', 'https://api.fghrsh.net/live2d/get/?id='+modelId+'-'+modelTexturesId);
}

function loadRandModel(){
    var modelId = localStorage.getItem('modelId');
    var modelTexturesId = localStorage.getItem('modelTexturesId');
    
    var modelTexturesRandMode = 'rand';     // 可选 'rand'(随机), 'switch'(顺序)
    
    $.ajax({
        cache: false,
        url: 'https://api.fghrsh.net/live2d/'+modelTexturesRandMode+'_textures/?id='+modelId+'-'+modelTexturesId,
        dataType: "json",
        success: function (result){
            if (result.textures['id'] == 1 && (modelTexturesId == 1 || modelTexturesId == 0)) {
                showMessage('NO !', 3000, true);
            } else {
                showMessage('LaLaLaLaaaa~', 3000, true);
            }
            loadModel(modelId, result.textures['id']);
        }
    });
}

function loadOtherModel(){
    var modelId = localStorage.getItem('modelId');
    
    var modelTexturesRandMode = 'switch';     // 可选 'rand'(随机), 'switch'(顺序)
    
    $.ajax({
        cache: false,
        url: 'https://api.fghrsh.net/live2d/'+modelTexturesRandMode+'/?id='+modelId,
        dataType: "json",
        success: function (result){
            loadModel(result.model['id']);
            showMessage(result.model['message'], 3000, true);
        }
    });
}