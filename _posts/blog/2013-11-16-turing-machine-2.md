---
layout: post
title: 图灵机（2）：世上第一个程序
description: 
category: blog
---

图灵机的一般流程如下（括号中是指令符号）：

设图灵机初始状态 s0，此时读写头读纸带，读到一个符号 a，然后根据操作规则，即机械化的指令，可以在纸带上：

1. 擦除符号（_）
2. 写下新符号（0,1）
3. 什么也不做（\*）<span style="display:none">a</span>

<br />

接着读写头可以：

1. 左移（l）
2. 右移（r）
3. 不动（\*）<span style="display:none">a</span>

<br />

最后将状态更新到 s1，或者停机 halt。例如读到 a，擦除掉并向右移动，可以写成如下指令：

    当前的状态 读到的符号 写下的符号 移动的方向 转向的状态
       s0        a         _        r         s1

<br />

图灵机的机械化指令就是这些五元组的集合，从最初的状态开始执行，或者不停地打印结果，或者最终停机。编程就是设计这些五元组，使它们最终产生自己想要的结果。是不是很简单？对在纸带上面间隔地打印出 0 和 1，当然是简单的：

（为方便起见，将状态使用单个字符的数字表示）

    0 * 0 r 1
    1 * * r 2
    2 * 1 r 3
    3 * * r 0

<br />

Yeah! 恭喜你写出了第一个图灵机程序（你可将上面的程序拷贝到[这里](http://morphett.info/turing/turing.html)看执行效果）。这也是世界上的第一个程序！在图灵[1936](http://classes.soe.ucsc.edu/cmps210/Winter11/Papers/turing-1936.pdf%E2%80%8E)的论文中第三节： 

![](/assets/images/tm01.png)

其中 m-config 一般翻译为 m-格局，横向看过去，也就是我上文所指的一条机械式指令。

这完全没有什么了不起！是的，就像苹果砸中了牛顿的脑袋，如果仅仅感觉到有点疼，牛顿就不是牛顿了。很可能不止图灵一人看到过，或者思考过类似的装置，第一眼有点意思，再看一眼无聊：如此简陋的东西会有什么功能？谁想在纸带上交替打印 0 和 1？疯子吧！

如果你不把它与强大的电脑联系起来，而是想想在数学中有一些先验的公理存在，这些公理是少数的、独立的，但通过推导，可以得出无数的定理，它们一起构建了整座数学大厦。图灵机基本的运作规则可以看作是公理，而程序是推导规则，或许这样类比，就更容易想象这台机器潜在的强大功能。

它到底有多强大？强大到能推导出整个宇宙的真理吗？如果不能，那它的极限又在哪里？这些问题正是图灵在论文的后面将要回答的。

图灵没有止步于此，你也不应该止步于此。


