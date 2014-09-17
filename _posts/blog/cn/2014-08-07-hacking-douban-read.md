---
layout: post
title: 电子书阅读方法
description: 以及如何导出豆瓣阅读中的书籍
categories: [blog,cn]
---

当然，这书是免费的或者你花钱买的。

电子书最早是在PC上看各种文档，比如PDF文档，PDF扫描文档，CHM，或者纯文本。对个人阅读者而言，这种阅读方式有一下几种问题：

####1. 难以高效地阅读

这是因为PC太大，屏幕只能固定摆放，用鼠标操作翻页，难得获得纸质书本的阅读效率；而且不能随身携带，充分利用闲散时间阅读。这个问题提出了便携的重要性。

####2. 难以高效做笔记

当你阅读很轻松的书，大可不必如此，但实际上任何领域的专业阅读，都需要你仔细进行分析阅读，那么笔记和划线功能必不可少，但传统PC阅读上的文档很少具备这样的功能，除非是Office文档，或者是专业版的Adobe Reader阅读非扫描版的PDF文档。这样引入了阅读笔记和标注的需求，更进一步，有读者阅读分享自己的阅读笔记或者评论，社交功能虽然在阅读领域并不强烈，但是对一些人非常重要。

####3. 需要文本分析

这当然是少部分人的需要，包括语言学领域的专业人士，或者自然语言处理领域的IT人士，他们或许需要更强大的检索和语义分析功能。这意味着，书籍的内容最好以纯文本的形式提供，或至少能将图片中的文字信息识别出来。

以上这些功能催生出了类似Kindle的阅读器以及整套的商店交易支付生态。而中国这个市场中国，以多看和豆瓣阅读最为出色。我自己就是豆瓣阅读的用户，但是... 仍然不满。

我在购买豆瓣图书的时候，没有看到 Disagree/Agree 的法律备注情况下，有一个基本的问题：

购买的电子版本，拥有对电子文档怎样的处理权利？

谁说不能导出到本地呢？

就我个人的习惯而言，喜欢保存txt为文档，因为太方便用程序去处理了，各种搜索，分类，甚至语义上的处理，购买电子书后，这种权利明显应该归消费者所有。

有人解释说你在上面购买的只是阅读权限，并没有分享和下载的权限，yeah... maybe.

我在豆瓣阅读的书籍页面发现他们使用了一些方法禁止全文拷贝，比如：

1. 似乎首次加载的时候电子书内容数据以加密的形式给到了客户端，尚不清楚加密方式。
2. 页面每次顶多显示5块数据，基本上填满1-2个页面。
3. 上下翻页的时候，更新这5块数据，保证html里面只有当前的内容，防止全文拷贝。

html源码如下图：

{:.post-img}
![](/assets/images/doubanread.png)

但其实在浏览器的develop mode中可以插入一段js代码，设置interval 自动scroll down，然后根据class/id 得到里面的文本内容：

{% highlight javascript %}
var book = [];                                                                     
var scroll_height = 800;                                                           

var getcontent = setInterval(function () {

  $('.page[data-pagination]').each( function(e){

    var i = $(this).attr('data-pagination');

    if( i !== undefined && book[i] === undefined ) {
      book[i] = $('.page[data-pagination='+i+']').find('.info, .headline, 
				.paragraph:not([data-offset])').text();
      console.debug(book[i]);
    }
  });                                                                              

  $("html, body").animate({ scrollTop: scroll_height });                           
  scroll_height += 1024;                                                           

}, 1000);                                                                          

clearInterval(getcontent); 
{% endhighlight %}                                                       

你还可以根据页面源码的更多信息得到书籍的元信息，以及样式，或者自定义样式，这样便能将原书近似地下载下来。

我下载之后，会按章节保存到evernote的笔记本中，这样基本上满足了我在文章开头提出的这三点要求。
