---
layout: post
title: Y Combinator （Part 3 推导）
description:
category: blog
---


尽管在简介中，凭着“直觉”得到了 Y 的 lambda 表达式，但始终未能真正点明它是如何“从无到有”形成的。如果按照简介中的观点，Y 如果是重构的结果（抽象出了递归过程），那它势必有一个重构的过程，这个重构的过程比“天才的直觉”更有价值，因为这个过程可能被通用应用到其他的场景中。这篇文章就尝试讲清楚这个过程是如何自然而然产生的。

##1. 最原始的 factorial 定义

<?prettify lang=scm?> <pre class="prettyprint">
     (define (factorial n)
      (if (= n 0) 1
          (* n (factorial (- n 1)))))
     
     (factorial 10)
</pre>

在任何编程语言的教材上面讲解函数的这一章都会看到。这种递归写法的关键是编程语言支持：

 1. 给函数命名a
 2. 在函数体内支持调用该函数自己a

对高级语言而言，这两点是显然的，C/C++, Java, Python 等语言都支持，实现起来会用到堆栈，每次调用都会将上次的调用保存起来，以便能返回。但对 lambda 而言，它们都是匿名的，在 lambda 表达式的体内无法引用自己，这就需要将 factorial 这个名字提取出来，提取的过程就是推导 Y 的过程。

##2. 将函数体内的 factorial 参数化

<?prettify lang=scm?> <pre class="prettyprint">
    (define (factorial g)
     (lambda (n)
       (if (= n 0) 1
           (* n ((g g) (- n 1))))))
    
    ((factorial factorial) 10)
</pre>

将参数 n 转移到函数内部，然后增加一个新参数 g，并把 factorial 自己作为参数 g 传递进去。

##3. Inline

<?prettify lang=scm?> <pre class="prettyprint">
    ((factorial factorial) 10) 
</pre>
  
看起来不是我们期望的形式，我们最终期望将 factorial 分解为 Y（抽象出来的递归结构）和 F（实质性的计算），因此将这个表示是用定义 Inline，就会写成：

<?prettify lang=scm?> <pre class="prettyprint">
    (((lambda (g)
       (lambda (n)
        (if (= n 0) 1
            (* n ((g g) (- n 1))))))
      (lambda (g)
         (lambda (n)
          (if (= n 0) 1
              (* n ((g g) (- n 1)))))))
    10)
</pre>

虽然看起来很丑，但计算结果是正确的，下面我们将从中提取（抽象/重构）出 Y 和 F。

##4. 将重复的代码提重构为一个新的函数

很明显有重复的代码，这相同的部分可以定义一个新函数：(lambda (x) (x x))

<?prettify lang=scm?> <pre class="prettyprint">
    (((lambda (x)
      (x x))
      (lambda (g)
         (lambda (n)
          (if (= n 0) 1
              (* n ((g g) (- n 1)))))))
    10)
</pre>

##5. 将函数内部（不愿意看到的）代码提取出来

观察 factorial 定义的内部存在 (g g) 表达式，很显然，我们不期望出现这样的代码，因为：
1) 它与计算 factorial 没有直接关系
2) (g g) 是不是似曾相识？它有递归的结构，说不定正是我们寻找的 Y 的一部分

提取内部代码的方法，就是将它当作参数：

<?prettify lang=scm?> <pre class="prettyprint">
    ((lambda (x)
     (x x))
     (lambda (g)
       ((lambda (h)
         (lambda (n)
          (if (= n 0) 1
              (* n (h (- n 1))))))
        (g g))))
   10)
</pre>

不！不要运行上面代码，会死循环的，因为这个参数 (g g) 会无限调用它自己！解决的方法也很简单，将它用 lambda 封装起来：

<?prettify lang=scm?> <pre class="prettyprint">
    (((lambda (x)
      (x x))
      (lambda (g)
        ((lambda (h)
          (lambda (n)
           (if (= n 0) 1
               (* n (h (- n 1))))))
         (lambda (v) ((g g) v)))))
    10)
</pre>

##6. 用同样的方法，将 (g g) 继续提取出去：

<?prettify lang=scm?> <pre class="prettyprint">
    (((lambda (x)
      (x x))
      (lambda (g)
       ((lambda (f)
        ((lambda (h)
          (lambda (n)
           (if (= n 0) 1
               (* n (h (- n 1))))))
         f))
        (lambda (v) ((g g) v)))))
    10)
</pre>

##7. 抽取出 fact

此时，在最里面的已经没有任何“奇怪”的计算，可以将计算 factorial 的部分抽象出来，命名为一个新的函数 fact：

<?prettify lang=scm?> <pre class="prettyprint">
    (define (fact h)
      (lambda (n)
        (if (= n 0) 1
          (* n (h (- n 1))))))
    
    (((lambda (x)
      (x x))
      (lambda (g)
       ((lambda (f)
          (fact f))
        (lambda (v) ((g g) v)))))
    10)
</pre>

##8. 将 fact 提取到最外层

同样使用参数化的技巧：

<?prettify lang=scm?> <pre class="prettyprint">
    (define (fact h)
      (lambda (n)
        (if (= n 0) 1
          (* n (h (- n 1))))))
    
    (((lambda (h)
     ((lambda (x)
      (x x))
      (lambda (g)
       ((lambda (v) (h v))
        (lambda (v) ((g g) v))))))
     fact)
    10)
</pre>

##9. 定义 Y

到目前为之，fact 的定义已经提取出来，而且作为最外层的参数传递给一个 lambda 表达式，这个 lambda 就是我们寻找的 Y：

<?prettify lang=scm?> <pre class="prettyprint">
    (define (fact h)
      (lambda (n)
        (if (= n 0) 1
          (* n (h (- n 1))))))
    
    (definf (Y h)
     ((lambda (x)
       (x x))
       (lambda (g)
        ((lambda (v) (h v))
         (lambda (v) ((g g) v))))))
    ((Y fact) 10)
</pre>

##10. 整理 Y

将 fact 的参数换成 g，将 Y 的参数换成 f；Y 最里面的 lambda 可以计算一次：

<?prettify lang=scm?> <pre class="prettyprint">
    (define (fact g)
      (lambda (n)
        (if (= n 0) 1
          (* n (g (- n 1))))))
    
    (define (Y f)
     ((lambda (x) (x x))
      (lambda (g) (f (lambda (v) ((g g) v))))))
    
    ((Y fact) 10)
</pre>

至此，通过以上的10步“重构”操作，成功地推导/提取除了 Y，将一个递归函数 factorial 分解为两个函数：Y和F。Y 负责递归，而 F 负责终止递归。Perfect！
这个推导过程并不容易，其中第5，6步尤其关键，是整个变换的核心步骤，其他的基本都是参数化的过程。另外补充一点，上面推导出来的 Y 和之前定义的 Y 并不完全相同：

<?prettify lang=scm?> <pre class="prettyprint">
    (define (Y f)
     ((lambda (x) (f (x x))
      (lambda (x) (f (x x))))
</pre>
   
原因在于推导出来的 Y 是基于 applicative eval 的 scheme， (lambda (v) ((g g) v)) 不能直接写成 (g g) 造成了这个差异，但是在 normal eval 的语言里面，比如 Haskell 可以直接写成这样。

以上推导过程也可以参考这个视频，视频中采用的步骤大同小异，这个视频使用的是 Ruby，并且对 lambda calculus 有介绍，我翻译并添加了中文字幕：

<p>
<embed src="http://player.youku.com/player.php/sid/XNTkzNzkxMTcy/v.swf" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>
</p>

<pre>
早上好，很高兴来到这里 ？？？
很好，很好，我也很高兴到这里拉来
今天早上我们讲讲 Y 组合子
在做的各位有多少人听说过 Y 组合子
只有一点，很好
这表示我想怎么讲都可以
我有丰富的演讲经验
我学到了发言的几条规则，尤其是关于主题演讲的
主题演讲和日常的讨论会有所不同
第一，主题演讲不会深入到普通技术细节当中
主要是为了激发在做的听众
所以你会放弃技术方面的主题
很高兴，今早的主题有关高深技术
如果我非得要谈技术，
那么至少希望是一些和日常编程相关的技术
会后在工作中还有点用处
我很高兴地告诉你们
这个演讲完全无关你们的日常使用
基本上你学不到能应用在你工作中的东西
好吧，如果非要无关，
但至少是一些在编程中好的示范吧
从中学到一些好的范例吧
我很高兴地告诉你们
这将会是你们看到的最糟糕的 Ruby 代码
唯一希望你们在这个演讲中得到一点点乐趣！
首先我希望你们中有人能参与进来
你们中有人帮我用计算机计算 cos 的值吗？
有人愿意吗？
就你，后排这位！太好了！
他过来了，好的
OK，我要你输入数字 0
确保是弧度计算模式
按 cos 键
有结果吗？
OK，再按 cos 键
OK，再按 cos 键
OK，再按 cos 键
继续按，过会我来找你
我们将谈到的主题叫“能行计算”
这个主题由一个叫艾伦图灵的人研究过
你们应该听说他发明了一台叫做图灵机的机器
图灵机有无限长的带子，上面有格子
可以在格子里面读写、擦除符号
也可以移动读写头
这些所有的操作都能用一种非常简单的程序编写出来
比如，当前的状态是1，则向左移动，进入...
这是非常幼稚的程序
这是一台图灵机
我曾经见过这种装置
你看这里，有个摄像头
它在读纸带上的字符
读到了1，又读到了1
在这里有个擦除头
可以檫掉1，换成0
这是一个计数器，初始化到了11
接着是12
接着是13
这是非常简单的程序
通过摄像头擦除上面的字符
并决定写上1或者0
然后进位，就这样
用于二进制的计数
现在记到了14
接着是15
然后是一路进位
擦除1
...
好了程序运行结束
这就是图灵机
有人能造一个出来吗？这太棒了
图灵说，任何“能有效计算的”都能通过这台挫逼机器计算出来
“能有效计算的” 指的是一些数学函数，逻辑命题，任何你能写成算法的东西
你可以编成图灵机的程序计算出来
这是伟大的思想
看看这篇论文的时间，是1936-7 年的
所以世界上第一个程序很可能就在 1936-7 年的德国
他所有这些研究都是在大脑和纸上完成的
那个时候没有计算机
所有这实际上计算机的前生
就在这个时间，有个名叫阿龙索丘奇的人
丘奇发明了 lambda 演算
你们也许听过
lambda 演算用于计算一些东西
它由这些部分组成
lambda 后面是变量符号 x
x 后面是一个点
用来分离变量和函数体
后面是函数体，只有一个 x
这是 Identidy 函数
你出入任何参数，会得到这个参数自己
这是 lambda 演算中非常简单的一个函数
这就是 lambda 演算
在 lambda 演算中没有字符串、整数、浮点数
只有函数和对函数的调用
那怎么去表示更有价值的一些东西？
这里是一些表示数字的方法
让我们看看数字 1
一个带 f 参数的 lambda 函数
返回一个以 x 为参数的函数
你可以简单地认为这个函数带两个参数
它将参数 f 应用到里面的函数
传递一次
这就表示数字1
数字2以 f x 为参数
并调用 f 两次
数字 0 调用 f 零次
我们能用这个方法表示任何数字
只需要调用 f 多次即可
这叫做丘奇枚举数
用 lambda 演算来表示数字
那么你怎么表示真和假
“真”是带两个参数的一个函数
返回第一个参数
“假”也是带两个参数的一个函数
返回第二个参数
“真”像是 if 表到是里面返回的 then
“假”像是 if 表到是里面返回的 else
这就是我们用 lambda 演算表示真值
[09:18]
</pre>

用同样的方法，你可以使用 python, clojure, javascript 等语言推导一遍，不会有太大的不同，因为它们都支持 lambda 表达式（匿名函数）。
