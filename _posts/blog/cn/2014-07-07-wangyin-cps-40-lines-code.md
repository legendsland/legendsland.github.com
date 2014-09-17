---
layout: post
title: 王垠的“40行天才代码 cps.ss” Explained
description: 
categories: [blog,cn]
---

> 我有什么资格说话呢？如果你要了解我的本事，真的很简单：我最精要的代码都放在[GitHub][1]上了。但是除非接受过专门的训练，你绝对不会理解它们的价值。你会很难想象，这样一片普通人看起来像是玩具的40行[cps.ss][2]代码，融入了我一个星期的日日夜夜的心血，数以几十计的推翻重写。这段代码，曾经耗费了一些顶尖专家十多年的研究。一个教授告诉我，光是想看懂他们的论文就需要不止一个月。而它却被我在一个星期之内闷头写出来了。我是在说大话吗？代码就摆在那里，自己去看看不就知道了。当我死后，如果有人想要知道什么是我上半生最重要的“杰作”，也就是这40行代码了。它蕴含的美，超越我给任何公司写的成千上万行的代码。

##1. 背景知识

CPS: Continuation-Passing Style. 有一篇介绍 CPS 通俗易懂的文章（中文翻译）。

简单来讲，CPS 是一种编程风格：

Javascript:

（原味）
function foo(x) {
  return x ;
}


（CPS）
function cps_foo(x, return_point) {
  return return_point (x) ;
}

CPS 多了一个参数 return_point，return_point 来自 caller ，是 caller 所在的“世界”，caller 将这个“世界” 传递给 callee (cps_foo)，这样 cps_foo 就无须利用额外的工具（比如堆栈）去查询 caller 的世界在哪里，以便返回，而是直接进入这个世界：return_point (x)。 这便是 CPS 的初衷 —— 去掉层层嵌套的世界。行话讲就是 desugar（脱糖）。Syntax sugar 是为了方便人类的表达和理解，给编程语言的核心套上的一层好吃好看的外衣，而对机器对程序的解释，需要将其还原到最本质的结构，以便机械化处理和优化，这 就是脱糖的意义。


以函数式编程的观点来看，return_point 是一个函数，以 C 观点来看，你可以把它理解为程序地址，或者，以 Matrix 来看，它是 key-maker 打开门进入新世界的那把钥匙。“世界”上只有一个巨大的程序（比如，你的程序不过是在 chrome 里面运行的一个小程序，而 chrome 又是在 OS 里面的一个小程序），return_point 将各种小程序窜连起来了。恩，差不多就是这个意思。只不过，在函数式程序里面（比如Scheme）里面，return_point 是函数，而在过程式程序（比如C）里面它更像是 0x4f36a0c4。

这段 40 多行代码是给 Scheme 程序脱糖的程序，属于解释器的代码，而不是应用代码。对其的客观评价显然只有设计解释器的人才能给出。对应用程序员的意义在于，发现每天上班时编写的代码多么无聊，此外并没有任何实用价值。


##2. 运行结果

{% highlight scheme %}
'x
'(lambda (x k) (k x))
'(lambda (x k) (x 1 k))
'(f x (lambda (v0) (if v0 a b)))
'(if x (f a (lambda (v0) v0)) b)
'(lambda (x k) (f x (lambda (v0) (if v0 (k a) (k b)))))
'(lambda (x k) (let ((k (lambda (v0) (if v0 (k c) (k d))))) (if x (f a k) (k b))))
'(lambda (x k) (let ((k (lambda (v0) (if v0 (k c) (k d))))) (if x (k (zero? a)) (k b))))
'(lambda (x k) (if t (if x (f a k) (k b)) (k c)))
'(lambda (x k) (let ((k (lambda (v0) (if v0 (k e) (k w))))) (if t (if x (f a k) (k b)) (k c))))
'(lambda (x k) (let ((k (lambda (v0) (h v0 k)))) (if x (f a k) (k b))))
'(lambda (x k) (let ((k (lambda (v0) (v0 c k)))) (if x (f g k) (k h))))
'(f a (lambda (v0) (g b (lambda (v1) (v0 v1 (lambda (v2) (f c (lambda (v3) (g d (lambda (v4) (v3 v4 (lambda (v5) (v2 v5 (lambda (v6) v6))))))))))))))
'(lambda (n k)
((lambda (fact k) (fact fact (lambda (v0) (v0 n k))))
(lambda (fact k)
(k
(lambda (n k)
(if (zero? n)
(k 1)
(fact
fact
(lambda (v1) (v1 (sub1 n) (lambda (v2) (k (* n v2))))))))))
k))
120
{% endhighlight %}

原代码中最后一句 ((eval fact-cps ) 5 (lambda (v) v)) 在 racket 中要修改为：
((eval fact-cps (make-base-namespace)) 5 (lambda (v) v)) 才能通过算得 120。

##3. 注释

{:.post-img}
![](/assets/images/cps.png)


##4. 要点

ctx: 函数在执行(apply)时候的上下文环境，可理解为 C 程序中运行时的栈。

整 个 cps 的（主要）过程就是 if 分支在不断制造新的 ctx, 而 apply 分支（最后一个分支）不断在新的 ctx 中 '计算' （实际上是生成 cps 函数的代码，而不是真的计算），并返回结果（到上一层 ctx）的过程。这个过程就是 scheme 的基本 eval-apply 过程。（参见SICP第四章）

这是一个解释器（解释成为 CPS 风格的代码），同时也是一个CPS转换器，正所谓 Compiling with Continuations. 另外，Scheme 这种代码即数据（字符串列表）的特性，使得编写生成代码的代码相对容易和简洁。

至于代码为何有 k 这个命名。呵呵，你可以叫它 kontinuation 或者 klosure. 

##5. 结论

以自然语言写作比喻，编写自解释器级别的代码，就像你在写一本小说，而小说的主角也在写一本小说，这位主角在描写你，对你的刻画会影响到你，你受到影响之后又会改变小说中的主角，从而影响到他对你的描写。你俩要相安无事，情节合符逻辑地发展，直到最后圆满的结尾。这比写一本普通小说可难多了。


[1]:https://github.com/yinwang0/gems
[2]:https://github.com/yinwang0/lightsabers/blob/6a66c294d4c4217efebfdeae18ee4697d802f79e/cps.ss
