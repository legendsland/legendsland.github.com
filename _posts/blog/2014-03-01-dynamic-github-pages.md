---
layout: post
title: 动态 Github Pages
description: 
category: blog
---

如果你还没有读过 [Blogging Like a Hacker][1]，赶紧读读。如果你已经读了，把你并且在 github 上面有自己的 [pages][4] 当作博客，使用 markdown 写作，用 Jekyll 设计页面，用 git 发布，你可以继续往下看。

Jekyll 是用 Ruby 实现的静态网页生成框架，它处理 markdown 文档的一般流程如下：

 1. 使用 Liqiud 处理模板
 2. 将 markdown 文本转换成 html
 3. 使用 git push 到 github pages 服务器
 4. 在浏览器中访问你的 github pages 主页

也就是说，整个过程是生成静态页面的过程，github 无法给你提供任何服务端的运行，只是作为一个静态页面的托管主机。对博客写作而言，如果只是写点文章，顶多配点图片，完全够了，如果你懂得 css 设计，会一点页面的动态脚本，那就完全能定制自己喜欢的页面，用喜欢的字体、颜色和布局，这一切在 Jekyll 和 Github 上完全能做到。

但如果你不满足于此，你想添加读者的留言板，或者评论框，通过第三方的应用脚本也可以做到，比如 [Disqus][2]，但是... 如果你是因为 Blogging like a **HACKER** 而开始的，你一定会在乎：从内容到样式完全由自己控制和定制。第三方的评论系统虽然用起来简单，但它并不属于你，你大概不想在自己的页面上添加这些“乱七八糟”的东西。而且，如果你的博客访问者来自中国，由于不可知的原因，他们访问 disque 会恨慢。

你是 Hacker，你想控制一切，你必须控制一切。

Github 当然是为 hacker 而生。它提供了[丰富的 api 接口][3]，让你通过程序访问到 git 系统里面的数据，包括 Create, Read, Update, Delete 等等。合理地使用这些接口，并组织自己的数据文件，比如使用 json 格式，它能提供给你简易的数据库访问功能。使用 Javascript 将其整合到静态页面中，你便获得了动态 Github Pages 的功能 —— 虽然很原始。

这个想法就像是，将服务器的功能完全剥离，只保留数据的交互功能，所有的逻辑全部放到 client-side 浏览器中执行。好处自然是服务器极低的负载，坏处就是浏览器需要承受大量的计算和渲染。当然，作为不会有多少数据的评论系统，这样的做法是可以接受的。何况，这是完全免费的。

在文章的下面你可以看到评论部分，已经有的评论是在页面加载完成之后，向 github 的评论数据 repo 发起的 ajax 请求，将得到对应页面的 json 数据，并展现出来。下面是添加评论，分别输入你的 id 和评论的内容，点击添加之后，ajax 带上页面 url 的参数去 repo 获得对应的评论文件，如果不存在则在 repo 中新建文件，并将文件与页面的对应关系保存起来，接下来就会有一次 commit 请求 —— 增加一条新的评论等于一次 commit 操作，而且在 commit message 里面可以... 任意发挥，保存自己想保存的任何东西，你会发现这是非常有用的处理。

一旦服务器提供 json 文件的存储和更新，你可以将你需要功能的数据都保存到里面，唯一麻烦的是，类似于数据库访问层需要你使用 client javacsript 重做一遍。Server-side 的 Javascript Database API 比如 mongoose 的接口，提供了很好的参考标准。最早的时候，Web app 使用 C 作为服务端 cgi，而今有在客户端完全处理这些逻辑的能力，包括页面生成和渲染。

回头看看那篇文章，也许它并不是在教你搭建一个免费的博客，看起来酷酷的，这种廉价的黑客并不稀奇，重要的是，它告诉你，在众多的循规蹈矩之外，总有令人惊异的做法，而仅此小小的一点便能让你成为真正的黑客。

**Happy Comment!**

[1]: http://tom.preston-werner.com/2008/11/17/blogging-like-a-hacker.html
[2]: http://disqus.com
[3]: https://developer.github.com
[4]: https://pages.github.com
